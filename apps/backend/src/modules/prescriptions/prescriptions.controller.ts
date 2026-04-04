import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { Response } from 'express';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrescriptionStatus } from '@prisma/client';

@ApiTags('prescriptions')
@Controller({ path: 'prescriptions', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(Role.DOCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new prescription (Doctor only)' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(userId, createPrescriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get prescriptions (filtered by role)' })
  async findAll(
    @CurrentUser() user: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: PrescriptionStatus,
    @Query('patientId') patientId?: string,
  ) {
    const params = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      status,
      patientId,
    };

    if (user.role === Role.PATIENT) {
      return this.prescriptionsService.findForPatient(user.id, params);
    }

    if (user.role === Role.DOCTOR) {
      return this.prescriptionsService.findForDoctor(user.id, params);
    }

    // Admin can see all or filter by patientId
    return this.prescriptionsService.findAll(params);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user prescriptions' })
  async getMyPrescriptions(
    @CurrentUser() user: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    if (user.role === Role.DOCTOR) {
      return this.prescriptionsService.findForDoctor(user.id, { skip, take });
    }
    return this.prescriptionsService.findForPatient(user.id, { skip, take, activeOnly });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  async findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for prescription' })
  @ApiProduces('application/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.prescriptionsService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get(':id/validity')
  @ApiOperation({ summary: 'Check if prescription is valid' })
  async checkValidity(@Param('id') id: string) {
    return this.prescriptionsService.checkValidity(id);
  }

  @Patch(':id/cancel')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a prescription (Doctor or Admin)' })
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.prescriptionsService.cancel(id, userId);
  }

  @Patch(':id/complete')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark prescription as completed' })
  async complete(@Param('id') id: string) {
    return this.prescriptionsService.complete(id);
  }
}
