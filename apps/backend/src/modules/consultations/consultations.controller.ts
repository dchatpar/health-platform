import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('consultations')
@Controller({ path: 'consultations', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post('appointment/:appointmentId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create consultation for an appointment' })
  async createForAppointment(@Param('appointmentId') appointmentId: string) {
    return this.consultationsService.createForAppointment(appointmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by ID' })
  async findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get consultation by room ID' })
  async findByRoomId(@Param('roomId') roomId: string) {
    return this.consultationsService.findByRoomId(roomId);
  }

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Get consultation by appointment ID' })
  async findByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.consultationsService.findByAppointment(appointmentId);
  }

  @Patch(':id/start')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start consultation (Doctor only)' })
  async start(@Param('id') id: string) {
    return this.consultationsService.start(id);
  }

  @Patch(':id/end')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End consultation (Doctor only)' })
  async end(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.consultationsService.end(id, notes);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel consultation' })
  async cancel(@Param('id') id: string) {
    return this.consultationsService.cancel(id);
  }

  @Patch(':id/recording')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add recording URL (Doctor only)' })
  async addRecording(@Param('id') id: string, @Body('recordingUrl') recordingUrl: string) {
    return this.consultationsService.updateRecording(id, recordingUrl);
  }

  @Patch(':id/notes')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add consultation notes (Doctor only)' })
  async addNotes(@Param('id') id: string, @Body('notes') notes: string) {
    return this.consultationsService.addNotes(id, notes);
  }
}
