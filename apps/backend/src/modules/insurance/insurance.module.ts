import { Module } from '@nestjs/common';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { ClaimService } from './claim.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InsuranceController],
  providers: [InsuranceService, ClaimService],
  exports: [InsuranceService, ClaimService],
})
export class InsuranceModule {}
