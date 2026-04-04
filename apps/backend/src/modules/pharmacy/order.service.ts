import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly ORDER_EXPIRY_MINUTES = 10;

  constructor(private readonly prismaService: PrismaService) {}

  async create(patientId: string, createOrderDto: CreateOrderDto) {
    // Verify pharmacy exists and is active
    const pharmacy = await this.prismaService.pharmacy.findUnique({
      where: { id: createOrderDto.pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${createOrderDto.pharmacyId} not found`);
    }

    if (!pharmacy.isActive) {
      throw new BadRequestException('Pharmacy is not active');
    }

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.ORDER_EXPIRY_MINUTES);

    // Process order items and calculate totals
    const orderItems: Array<{
      medicineStockId: string;
      medicineName: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }> = [];

    let totalAmount = new Prisma.Decimal(0);

    for (const item of createOrderDto.items) {
      const stock = await this.prismaService.medicineStock.findUnique({
        where: { id: item.medicineStockId },
        include: { medicine: true },
      });

      if (!stock) {
        throw new NotFoundException(`Medicine stock with ID ${item.medicineStockId} not found`);
      }

      if (!stock.isAvailable) {
        throw new BadRequestException(`Medicine ${stock.medicine.name} is not available`);
      }

      if (stock.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${stock.medicine.name}. Available: ${stock.quantity}`,
        );
      }

      if (stock.pharmacyId !== createOrderDto.pharmacyId) {
        throw new BadRequestException('All items must be from the same pharmacy');
      }

      const itemTotal = stock.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItems.push({
        medicineStockId: item.medicineStockId,
        medicineName: stock.medicine.name,
        quantity: item.quantity,
        unitPrice: stock.price,
        totalPrice: itemTotal,
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create order with items
    const order = await this.prismaService.order.create({
      data: {
        orderNumber,
        patientId,
        pharmacyId: createOrderDto.pharmacyId,
        items: {
          create: orderItems,
        },
        totalAmount,
        patientAmount: totalAmount, // Initially all patient pays
        status: OrderStatus.PENDING,
        prescriptionId: createOrderDto.prescriptionId,
        expiresAt,
        deliveryAddress: createOrderDto.deliveryAddress,
        deliveryPhone: createOrderDto.deliveryPhone,
      },
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
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

    // Schedule auto-cancellation (in a real app, use a job queue)
    this.scheduleAutoCancel(order.id);

    return order;
  }

  private scheduleAutoCancel(orderId: string) {
    // In production, this would be handled by a job queue (Bull, Agenda, etc.)
    setTimeout(
      async () => {
        try {
          const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
          });

          if (order && order.status === OrderStatus.PENDING) {
            await this.prismaService.order.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.EXPIRED,
                cancelledAt: new Date(),
              },
            });
            this.logger.log(`Order ${orderId} auto-cancelled due to payment timeout`);
          }
        } catch (error) {
          this.logger.error(`Error auto-cancelling order ${orderId}: ${(error as Error).message}`);
        }
      },
      this.ORDER_EXPIRY_MINUTES * 60 * 1000,
    );
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    patientId?: string;
    pharmacyId?: string;
    status?: OrderStatus;
  }) {
    const { skip = 0, take = 20, patientId, pharmacyId, status } = params;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          pharmacy: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
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
      }),
      this.prismaService.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        pharmacy: true,
        items: {
          include: {
            medicineStock: {
              include: {
                medicine: true,
              },
            },
          },
        },
        claims: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findForPatient(
    patientId: string,
    params: {
      skip?: number;
      take?: number;
      status?: OrderStatus;
    },
  ) {
    return this.findAll({ ...params, patientId });
  }

  async findForPharmacy(
    pharmacyId: string,
    params: {
      skip?: number;
      take?: number;
      status?: OrderStatus;
    },
  ) {
    return this.findAll({ ...params, pharmacyId });
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, userId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.EXPIRED],
      CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
      READY: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      DELIVERED: [],
      CANCELLED: [],
      EXPIRED: [],
    };

    if (!validTransitions[order.status].includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${updateStatusDto.status}`,
      );
    }

    const updateData: any = { status: updateStatusDto.status };

    switch (updateStatusDto.status) {
      case OrderStatus.CONFIRMED:
        updateData.confirmedAt = new Date();
        break;
      case OrderStatus.READY:
        updateData.readyAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        // Restore stock
        await this.restoreStock(id);
        break;
    }

    return this.prismaService.order.update({
      where: { id },
      data: updateData,
      include: {
        pharmacy: true,
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
  }

  private async restoreStock(orderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;

    for (const item of order.items) {
      await this.prismaService.medicineStock.update({
        where: { id: item.medicineStockId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  async cancel(id: string, userId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.EXPIRED) {
      throw new BadRequestException('Order is already cancelled or expired');
    }

    return this.prismaService.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }

  async processPayment(orderId: string, paymentId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Order is already paid');
    }

    return this.prismaService.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
        paymentId,
        status: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });
  }

  async applyInsurance(
    orderId: string,
    insurancePolicyId: string,
    claimId: string,
    approvedAmount: number,
    coPayAmount: number,
  ) {
    return this.prismaService.order.update({
      where: { id: orderId },
      data: {
        insurancePolicyId,
        insuranceAmount: approvedAmount,
        patientAmount: coPayAmount,
      },
    });
  }

  async getOrderSummary(id: string) {
    const order = await this.findOne(id);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      pharmacy: {
        id: order.pharmacy.id,
        name: order.pharmacy.name,
      },
      status: order.status,
      items: order.items.map((item) => ({
        medicineName: item.medicineName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totalAmount: order.totalAmount,
      insuranceAmount: order.insuranceAmount,
      patientAmount: order.patientAmount,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
    };
  }
}
