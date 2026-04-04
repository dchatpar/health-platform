import { Module } from '@nestjs/common';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { MedicineService } from './medicine.service';
import { OrderService } from './order.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PharmacyController],
  providers: [PharmacyService, MedicineService, OrderService],
  exports: [PharmacyService, MedicineService, OrderService],
})
export class PharmacyModule {}
