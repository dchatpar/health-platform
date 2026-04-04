import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    walletId?: string;
    userId?: string;
    type?: string;
    status?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
  }) {
    const { skip = 0, take = 50, walletId, userId, type, status, fromDate, toDate } = params;

    const where: any = {};

    if (walletId) {
      where.walletId = walletId;
    }

    if (userId) {
      where.wallet = { userId };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prismaService.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            select: {
              userId: true,
            },
          },
        },
      }),
      this.prismaService.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findForUser(
    userId: string,
    params: {
      skip?: number;
      take?: number;
      type?: string;
    },
  ) {
    return this.findAll({
      ...params,
      userId,
    });
  }

  async findOne(id: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      include: {
        wallet: {
          select: {
            userId: true,
            balance: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async getTransactionSummary(
    userId: string,
    params: {
      fromDate?: string;
      toDate?: string;
    },
  ) {
    const { fromDate, toDate } = params;

    const where: any = {
      wallet: { userId },
    };

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [credits, debits] = await Promise.all([
      this.prismaService.transaction.aggregate({
        where: {
          ...where,
          type: { in: ['TOPUP', 'REFUND'] },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prismaService.transaction.aggregate({
        where: {
          ...where,
          type: { in: ['PAYMENT', 'WITHDRAWAL'] },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalCredits = credits._sum.amount?.toNumber() || 0;
    const totalDebits = debits._sum.amount?.toNumber() || 0;

    return {
      totalCredits,
      totalDebits,
      netChange: totalCredits - totalDebits,
      creditCount: credits._count,
      debitCount: debits._count,
      fromDate,
      toDate,
    };
  }

  async getAuditTrail(
    userId: string,
    params: {
      skip?: number;
      take?: number;
    },
  ) {
    const { skip = 0, take = 100 } = params;

    // Get all transactions for the user with full audit info
    const wallet = await this.prismaService.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return {
        data: [],
        meta: { total: 0, skip, take, totalPages: 0 },
      };
    }

    const [transactions, total] = await Promise.all([
      this.prismaService.$queryRaw`
        SELECT
          t.id,
          t.type,
          t.amount,
          t.balance_before as "balanceBefore",
          t.balance_after as "balanceAfter",
          t.reference,
          t.description,
          t.status,
          t.metadata,
          t.created_at as "createdAt"
        FROM transactions t
        WHERE t.wallet_id = ${wallet.id}
        ORDER BY t.created_at DESC
        LIMIT ${take} OFFSET ${skip}
      `,
      this.prismaService.transaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
