import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInsurancePolicyDto, UpdateInsurancePolicyDto } from './dto';
import { InsurancePolicyStatus } from '@prisma/client';

@Injectable()
export class InsuranceService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPolicy(createPolicyDto: CreateInsurancePolicyDto) {
    // Check if policy number already exists
    const existing = await this.prismaService.insurancePolicy.findUnique({
      where: { policyNumber: createPolicyDto.policyNumber },
    });

    if (existing) {
      throw new BadRequestException('Policy number already exists');
    }

    return this.prismaService.insurancePolicy.create({
      data: {
        policyNumber: createPolicyDto.policyNumber,
        providerId: createPolicyDto.providerId,
        patientId: createPolicyDto.patientId,
        policyType: createPolicyDto.policyType,
        coverageAmount: createPolicyDto.coverageAmount,
        deductible: createPolicyDto.deductible ?? 0,
        copayPercentage: createPolicyDto.copayPercentage ?? 20,
        startDate: new Date(createPolicyDto.startDate),
        endDate: new Date(createPolicyDto.endDate),
        coveredCategories: createPolicyDto.coveredCategories ?? [],
        excludedMedicines: createPolicyDto.excludedMedicines ?? [],
        status: InsurancePolicyStatus.ACTIVE,
      },
    });
  }

  async findAllPolicies(params: {
    skip?: number;
    take?: number;
    patientId?: string;
    status?: InsurancePolicyStatus;
  }) {
    const { skip = 0, take = 20, patientId, status } = params;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [policies, total] = await Promise.all([
      this.prismaService.insurancePolicy.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.insurancePolicy.count({ where }),
    ]);

    return {
      data: policies,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findPolicyById(id: string) {
    const policy = await this.prismaService.insurancePolicy.findUnique({
      where: { id },
      include: {
        claims: true,
      },
    });

    if (!policy) {
      throw new NotFoundException(`Insurance policy with ID ${id} not found`);
    }

    return policy;
  }

  async findPolicyByNumber(policyNumber: string) {
    const policy = await this.prismaService.insurancePolicy.findUnique({
      where: { policyNumber },
    });

    if (!policy) {
      throw new NotFoundException(`Insurance policy ${policyNumber} not found`);
    }

    return policy;
  }

  async findPatientPolicies(patientId: string) {
    return this.prismaService.insurancePolicy.findMany({
      where: {
        patientId,
        status: InsurancePolicyStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePolicy(id: string, updatePolicyDto: UpdateInsurancePolicyDto) {
    const policy = await this.prismaService.insurancePolicy.findUnique({
      where: { id },
    });

    if (!policy) {
      throw new NotFoundException(`Insurance policy with ID ${id} not found`);
    }

    return this.prismaService.insurancePolicy.update({
      where: { id },
      data: updatePolicyDto,
    });
  }

  async validatePolicy(policyId: string): Promise<{
    isValid: boolean;
    reason?: string;
    policy?: any;
  }> {
    const policy = await this.prismaService.insurancePolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      return { isValid: false, reason: 'Policy not found' };
    }

    if (policy.status !== InsurancePolicyStatus.ACTIVE) {
      return { isValid: false, reason: `Policy is ${policy.status.toLowerCase()}` };
    }

    if (policy.endDate < new Date()) {
      return { isValid: false, reason: 'Policy has expired' };
    }

    if (policy.startDate > new Date()) {
      return { isValid: false, reason: 'Policy has not started yet' };
    }

    return { isValid: true, policy };
  }

  async checkMedicineCoverage(
    policyId: string,
    medicineName: string,
    category: string,
  ): Promise<{ covered: boolean; reason?: string }> {
    const policy = await this.prismaService.insurancePolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    // Check exclusions first
    if (policy.excludedMedicines.length > 0) {
      const isExcluded = policy.excludedMedicines.some((excluded) =>
        medicineName.toLowerCase().includes(excluded.toLowerCase()),
      );
      if (isExcluded) {
        return { covered: false, reason: 'Medicine is excluded under policy' };
      }
    }

    // Check covered categories
    if (policy.coveredCategories.length > 0) {
      const isCovered = policy.coveredCategories.some((cat) =>
        category.toLowerCase().includes(cat.toLowerCase()),
      );
      if (!isCovered) {
        return { covered: false, reason: 'Medicine category not covered under policy' };
      }
    }

    return { covered: true };
  }

  async calculateCoPay(policyId: string, amount: number): Promise<number> {
    const policy = await this.prismaService.insurancePolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    // First apply deductible
    let remainingAmount = amount;
    const deductible = policy.deductible.toNumber();
    if (deductible > 0) {
      if (amount <= deductible) {
        return amount; // Patient pays full amount up to deductible
      }
      remainingAmount = amount - deductible;
    }

    // Then apply copay percentage
    const coPayAmount = remainingAmount * (policy.copayPercentage / 100);
    return Math.round(coPayAmount * 100) / 100;
  }
}
