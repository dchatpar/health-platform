import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TransactionService } from './transaction.service';
import { TopUpWalletDto, PaymentDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentStatus } from '@prisma/client';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  // Wallet endpoints
  @Get('wallet')
  @ApiOperation({ summary: 'Get current user wallet' })
  async getWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Get('wallet/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.walletService.getBalance(userId);
    return { balance };
  }

  @Post('wallet/topup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Top up wallet' })
  async topUp(@CurrentUser('id') userId: string, @Body() topUpDto: TopUpWalletDto) {
    return this.walletService.topUp(userId, topUpDto);
  }

  @Post('wallet/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process payment' })
  async pay(@CurrentUser('id') userId: string, @Body() paymentDto: PaymentDto) {
    return this.walletService.processPayment(userId, paymentDto);
  }

  // Transaction endpoints
  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('type') type?: string,
  ) {
    return this.transactionService.findForUser(userId, { skip, take, type });
  }

  @Get('transactions/summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  async getTransactionSummary(
    @CurrentUser('id') userId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.transactionService.getTransactionSummary(userId, { fromDate, toDate });
  }

  @Get('transactions/audit')
  @ApiOperation({ summary: 'Get audit trail' })
  async getAuditTrail(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.transactionService.getAuditTrail(userId, { skip, take });
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async getTransaction(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }
}
