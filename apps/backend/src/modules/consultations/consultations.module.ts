import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsGateway } from './consultations.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, ConsultationsGateway],
  exports: [ConsultationsService, ConsultationsGateway],
})
export class ConsultationsModule {}
