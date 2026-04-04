import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsuranceService } from './insurance.service';
import { ProcessClaimDto, ReviewClaimDto } from './dto';
import { ClaimStatus, OrderStatus, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface ClaimItemResult {
  medicineName: string;
  requestedAmount: number;
  approvedAmount: number | null;
  covered: boolean;
  reason: string | null;
}

export interface ClaimResult {
  claimId: string;
  claimNumber: string;
  status: ClaimStatus;
  totalAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  coPayAmount: number;
  items: ClaimItemResult[];
  invoiceSplit: {
    insurancePayable: number;
    patientCoPay: number;
    nonCovered: number;
  };
}

@Injectable()
export class ClaimService {
  private readonly logger = new Logger(ClaimService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly insuranceService: InsuranceService,
  ) {}

  /**
   * Process a claim for an order following the SRS requirements:
   *
   * 1. Load pharmacy order
   * 2. Match each medicine with insurance catalog
   * 3. If all not covered → rejection
   * 4. If single item not covered → rejection
   * 5. Else → mixed items (covered + REJECTED)
   * 6. Non-covered: status=REJECTED, reason="Not covered under policy"
   * 7. Invoice split: insurance payable, patient co-pay, non-covered
   */
  async processClaim(processClaimDto: ProcessClaimDto): Promise<ClaimResult> {
    const { orderId, insurancePolicyId } = processClaimDto;

    // 1. Load pharmacy order with items
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            medicineStock: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.EXPIRED) {
      throw new BadRequestException('Cannot process claim for cancelled or expired order');
    }

    // Check if order already has a pending or approved claim
    const existingClaim = await this.prismaService.claim.findFirst({
      where: {
        orderId: orderId,
        status: { in: [ClaimStatus.PENDING, ClaimStatus.APPROVED, ClaimStatus.PARTIALLY_APPROVED] },
      },
    });

    if (existingClaim) {
      throw new BadRequestException('Order already has an associated active claim');
    }

    // Validate insurance policy
    const policyValidation = await this.insuranceService.validatePolicy(insurancePolicyId);
    if (!policyValidation.isValid) {
      throw new BadRequestException(`Insurance policy is not valid: ${policyValidation.reason}`);
    }

    const policy = policyValidation.policy;

    // Generate claim number
    const claimNumber = `CLM-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 2. Match each medicine with insurance catalog
    const itemResults: ClaimItemResult[] = [];
    let totalRequested = 0;
    let totalCovered = 0;
    let allNotCovered = true;
    let someNotCovered = false;

    for (const orderItem of order.items) {
      const medicineName = orderItem.medicineName;
      const category = orderItem.medicineStock.medicine.category;
      const requestedAmount = orderItem.totalPrice.toNumber();

      totalRequested += requestedAmount;

      // Check coverage
      const coverage = await this.insuranceService.checkMedicineCoverage(
        insurancePolicyId,
        medicineName,
        category,
      );

      if (coverage.covered) {
        allNotCovered = false;
        totalCovered += requestedAmount;

        // Calculate co-pay for this item
        const coPay = await this.insuranceService.calculateCoPay(
          insurancePolicyId,
          requestedAmount,
        );
        const insuredAmount = requestedAmount - coPay;

        itemResults.push({
          medicineName,
          requestedAmount,
          approvedAmount: insuredAmount,
          covered: true,
          reason: null,
        });
      } else {
        someNotCovered = true;

        itemResults.push({
          medicineName,
          requestedAmount,
          approvedAmount: null,
          covered: false,
          reason: 'Not covered under policy',
        });
      }
    }

    // 3-5. Determine claim status based on coverage
    let status: ClaimStatus;
    if (allNotCovered) {
      // 3. If all not covered → rejection
      status = ClaimStatus.REJECTED;
    } else if (!someNotCovered) {
      // 4. If single item not covered (impossible here since we checked above)
      // But this case means all items are covered
      status = ClaimStatus.APPROVED;
    } else {
      // 5. Else → mixed items (covered + REJECTED)
      status = ClaimStatus.PARTIALLY_APPROVED;
    }

    // 6. Calculate amounts
    const rejectedAmount = itemResults
      .filter((item) => !item.covered)
      .reduce((sum, item) => sum + item.requestedAmount, 0);

    const approvedAmount = itemResults
      .filter((item) => item.covered)
      .reduce((sum, item) => sum + (item.approvedAmount || 0), 0);

    // Calculate total co-pay (patient's share for covered items)
    const totalCoPay = await this.insuranceService.calculateCoPay(insurancePolicyId, totalCovered);

    // 7. Invoice split calculation
    const invoiceSplit = {
      insurancePayable: approvedAmount - totalCoPay,
      patientCoPay: totalCoPay + rejectedAmount, // Co-pay for covered + full price of non-covered
      nonCovered: rejectedAmount,
    };

    // Create the claim in database
    const claim = await this.prismaService.claim.create({
      data: {
        claimNumber,
        policyId: insurancePolicyId,
        orderId,
        totalAmount: totalRequested,
        approvedAmount: status === ClaimStatus.REJECTED ? 0 : approvedAmount - totalCoPay,
        rejectedAmount,
        coPayAmount: totalCoPay,
        status,
        items: {
          create: itemResults.map((item) => ({
            orderItemId: order.items.find((oi) => oi.medicineName === item.medicineName)?.id || '',
            medicineName: item.medicineName,
            requestedAmount: item.requestedAmount,
            approvedAmount: item.approvedAmount,
            covered: item.covered,
            reason: item.reason,
          })),
        },
      },
      include: {
        items: true,
        policy: true,
      },
    });

    // Update order with claim info
    await this.prismaService.order.update({
      where: { id: orderId },
      data: {
        insurancePolicyId,
        insuranceAmount: invoiceSplit.insurancePayable,
        patientAmount: invoiceSplit.patientCoPay,
      },
    });

    this.logger.log(`Claim ${claimNumber} processed with status ${status}`);

    return {
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      status: claim.status,
      totalAmount: totalRequested,
      approvedAmount: claim.approvedAmount?.toNumber() || 0,
      rejectedAmount: claim.rejectedAmount?.toNumber() || 0,
      coPayAmount: claim.coPayAmount?.toNumber() || 0,
      items: itemResults,
      invoiceSplit,
    };
  }

  async findAllClaims(params: {
    skip?: number;
    take?: number;
    policyId?: string;
    orderId?: string;
    status?: ClaimStatus;
  }) {
    const { skip = 0, take = 20, policyId, orderId, status } = params;

    const where: Prisma.ClaimWhereInput = {};
    if (policyId) where.policyId = policyId;
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    const [claims, total] = await Promise.all([
      this.prismaService.claim.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          policy: {
            select: {
              id: true,
              policyNumber: true,
              patientId: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
            },
          },
          items: true,
        },
      }),
      this.prismaService.claim.count({ where }),
    ]);

    return {
      data: claims,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findClaimById(id: string) {
    const claim = await this.prismaService.claim.findUnique({
      where: { id },
      include: {
        policy: true,
        order: {
          include: {
            items: {
              include: {
                medicineStock: {
                  include: {
                    medicine: true,
                  },
                },
              },
            },
          },
        },
        items: true,
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    return claim;
  }

  async findClaimByNumber(claimNumber: string) {
    const claim = await this.prismaService.claim.findFirst({
      where: { claimNumber },
      include: {
        policy: true,
        order: true,
        items: true,
      },
    });

    if (!claim) {
      throw new NotFoundException(`Claim ${claimNumber} not found`);
    }

    return claim;
  }

  async reviewClaim(reviewClaimDto: ReviewClaimDto) {
    const { claimId, status, approvedAmount, rejectedAmount, coPayAmount, reviewNotes } =
      reviewClaimDto;

    const claim = await this.prismaService.claim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${claimId} not found`);
    }

    if (claim.status !== ClaimStatus.PENDING) {
      throw new BadRequestException('Claim has already been reviewed');
    }

    const updateData: Prisma.ClaimUpdateInput = {
      status,
      reviewedAt: new Date(),
      reviewNotes,
    };

    if (approvedAmount !== undefined) {
      updateData.approvedAmount = approvedAmount;
    }

    if (rejectedAmount !== undefined) {
      updateData.rejectedAmount = rejectedAmount;
    }

    if (coPayAmount !== undefined) {
      updateData.coPayAmount = coPayAmount;
    }

    const updatedClaim = await this.prismaService.claim.update({
      where: { id: claimId },
      data: updateData,
      include: {
        items: true,
      },
    });

    // If approved or partially approved, update order amounts
    if (status === ClaimStatus.APPROVED || status === ClaimStatus.PARTIALLY_APPROVED) {
      await this.prismaService.order.update({
        where: { id: claim.orderId },
        data: {
          insuranceAmount: approvedAmount ?? claim.approvedAmount ?? new Prisma.Decimal(0),
          patientAmount: coPayAmount ?? claim.coPayAmount ?? new Prisma.Decimal(0),
        },
      });
    }

    this.logger.log(`Claim ${claim.claimNumber} reviewed with status ${status}`);

    return updatedClaim;
  }

  async settleClaim(id: string) {
    const claim = await this.prismaService.claim.findUnique({
      where: { id },
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    if (claim.status !== ClaimStatus.APPROVED && claim.status !== ClaimStatus.PARTIALLY_APPROVED) {
      throw new BadRequestException('Only approved claims can be settled');
    }

    if (claim.settledAt) {
      throw new BadRequestException('Claim has already been settled');
    }

    return this.prismaService.claim.update({
      where: { id },
      data: {
        settledAt: new Date(),
      },
    });
  }

  async getClaimSummary(id: string) {
    const claim = await this.findClaimById(id);

    return {
      claimNumber: claim.claimNumber,
      status: claim.status,
      totalAmount: claim.totalAmount,
      approvedAmount: claim.approvedAmount,
      rejectedAmount: claim.rejectedAmount,
      coPayAmount: claim.coPayAmount,
      itemCount: claim.items.length,
      reviewedAt: claim.reviewedAt,
      settledAt: claim.settledAt,
      createdAt: claim.createdAt,
    };
  }
}
