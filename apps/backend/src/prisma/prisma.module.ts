import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    await this.prismaService.$connect();
    console.log('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.prismaService.$disconnect();
    console.log('Database disconnected');
  }
}
