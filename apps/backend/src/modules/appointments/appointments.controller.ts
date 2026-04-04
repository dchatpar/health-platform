import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, CancelAppointmentDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('appointments')
@Controller({ path: 'appointments', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a new appointment' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(userId, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments (filtered by role)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async findAll(
    @CurrentUser() user: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: AppointmentStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const params = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      status,
      fromDate,
      toDate,
    };

    // Role-based filtering
    if (user.role === Role.PATIENT) {
      return this.appointmentsService.findForPatient(user.id, params);
    }

    if (user.role === Role.DOCTOR) {
      return this.appointmentsService.findForDoctor(user.id, params);
    }

    // Admin sees all
    return this.appointmentsService.findAll(params);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user appointments' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  async getMyAppointments(
    @CurrentUser() user: any,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: AppointmentStatus,
  ) {
    if (user.role === Role.DOCTOR) {
      return this.appointmentsService.findForDoctor(user.id, { skip, take, status });
    }
    return this.appointmentsService.findForPatient(user.id, { skip, take, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Get('doctor/:doctorId/slots')
  @ApiOperation({ summary: 'Get available slots for a doctor on a specific date' })
  async getAvailableSlots(@Param('doctorId') doctorId: string, @Query('date') date: string) {
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }

  @Patch(':id/confirm')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm an appointment (Doctor only)' })
  async confirm(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.appointmentsService.confirm(id, userId);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an appointment' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() cancelAppointmentDto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(id, userId, cancelAppointmentDto);
  }

  @Patch(':id/complete')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete an appointment (Doctor only)' })
  async complete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('diagnosis') diagnosis?: string,
  ) {
    return this.appointmentsService.complete(id, userId, diagnosis);
  }

  @Patch(':id/no-show')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark appointment as no-show (Doctor only)' })
  async markNoShow(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.appointmentsService.markNoShow(id, userId);
  }
}
