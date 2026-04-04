import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TopUpWalletDto, PaymentDto } from './dto';
import { PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getWallet(userId: string) {
    let wallet = await this.prismaService.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await this.prismaService.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'USD',
        },
      });
    }

    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance.toNumber();
  }

  async topUp(userId: string, topUpDto: TopUpWalletDto) {
    const wallet = await this.getWallet(userId);

    const previousBalance = wallet.balance.toNumber();
    const newBalance = previousBalance + topUpDto.amount;

    // Use transaction for atomic operation
    const [updatedWallet, transaction] = await this.prismaService.$transaction([
      this.prismaService.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      this.prismaService.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOPUP',
          amount: topUpDto.amount,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          reference: topUpDto.paymentId,
          description: 'Wallet top-up',
          status: PaymentStatus.COMPLETED,
        },
      }),
    ]);

    this.logger.log(
      `Wallet top-up: user ${userId}, amount ${topUpDto.amount}, new balance ${newBalance}`,
    );

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  async processPayment(userId: string, paymentDto: PaymentDto) {
    const wallet = await this.getWallet(userId);
    const balance = wallet.balance.toNumber();

    // Determine the amount to pay
    const amountToPay = paymentDto.amount;
    const useWallet = paymentDto.useWalletBalance;

    if (useWallet && balance < amountToPay) {
      throw new BadRequestException(
        `Insufficient wallet balance. Available: ${balance}, Required: ${amountToPay}`,
      );
    }

    const previousBalance = wallet.balance.toNumber();
    let newBalance: number;
    let walletDeducted = 0;

    if (useWallet) {
      walletDeducted = Math.min(amountToPay, balance);
      newBalance = previousBalance - walletDeducted;
    } else {
      newBalance = previousBalance;
    }

    // Determine reference
    let reference: string | undefined;
    let description: string;

    if (paymentDto.orderId) {
      reference = paymentDto.orderId;
      description = `Payment for order ${paymentDto.orderId}`;
    } else if (paymentDto.appointmentId) {
      reference = paymentDto.appointmentId;
      description = `Payment for appointment ${paymentDto.appointmentId}`;
    } else {
      description = 'Wallet payment';
    }

    const [updatedWallet, transaction] = await this.prismaService.$transaction([
      this.prismaService.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      this.prismaService.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYMENT',
          amount: walletDeducted,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          reference,
          description,
          status: PaymentStatus.COMPLETED,
          metadata: {
            originalAmount: amountToPay,
            walletDeducted,
            useWallet,
          },
        },
      }),
    ]);

    this.logger.log(
      `Payment processed: user ${userId}, amount ${amountToPay}, wallet deducted ${walletDeducted}`,
    );

    return {
      wallet: updatedWallet,
      transaction,
      paymentDetails: {
        originalAmount: amountToPay,
        walletDeducted,
        walletBalanceAfter: newBalance,
      },
    };
  }

  async autoPay(userId: string, amount: number, reference: string, description: string) {
    const wallet = await this.getWallet(userId);
    const balance = wallet.balance.toNumber();

    if (balance < amount) {
      return {
        success: false,
        reason: 'Insufficient balance',
        balance,
        required: amount,
      };
    }

    const previousBalance = balance;
    const newBalance = previousBalance - amount;

    const [updatedWallet, transaction] = await this.prismaService.$transaction([
      this.prismaService.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      this.prismaService.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYMENT',
          amount,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          reference,
          description,
          status: PaymentStatus.COMPLETED,
        },
      }),
    ]);

    this.logger.log(`Auto-pay processed: user ${userId}, amount ${amount}, reference ${reference}`);

    return {
      success: true,
      wallet: updatedWallet,
      transaction,
    };
  }

  async refund(userId: string, amount: number, reference: string, description: string) {
    const wallet = await this.getWallet(userId);
    const previousBalance = wallet.balance.toNumber();
    const newBalance = previousBalance + amount;

    const [updatedWallet, transaction] = await this.prismaService.$transaction([
      this.prismaService.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      this.prismaService.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'REFUND',
          amount,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          reference,
          description,
          status: PaymentStatus.COMPLETED,
        },
      }),
    ]);

    this.logger.log(`Refund processed: user ${userId}, amount ${amount}, reference ${reference}`);

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  async withdraw(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);
    const balance = wallet.balance.toNumber();

    if (balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${balance}, Requested: ${amount}`,
      );
    }

    const previousBalance = balance;
    const newBalance = previousBalance - amount;

    const [updatedWallet, transaction] = await this.prismaService.$transaction([
      this.prismaService.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      this.prismaService.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
          description: 'Wallet withdrawal',
          status: PaymentStatus.PENDING,
        },
      }),
    ]);

    this.logger.log(`Withdrawal requested: user ${userId}, amount ${amount}`);

    return {
      wallet: updatedWallet,
      transaction,
    };
  }
}
