import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ConsultationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createForAppointment(appointmentId: string) {
    // Check if consultation already exists
    const existing = await this.prismaService.consultation.findUnique({
      where: { appointmentId },
    });

    if (existing) {
      return existing;
    }

    // Verify appointment exists
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // Generate unique room ID for WebRTC
    const roomId = uuidv4();

    return this.prismaService.consultation.create({
      data: {
        appointmentId,
        roomId,
        status: 'WAITING',
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return consultation;
  }

  async findByRoomId(roomId: string) {
    const consultation = await this.prismaService.consultation.findFirst({
      where: { roomId },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with room ID ${roomId} not found`);
    }

    return consultation;
  }

  async findByAppointment(appointmentId: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation for appointment ${appointmentId} not found`);
    }

    return consultation;
  }

  async start(id: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    if (consultation.status !== 'WAITING') {
      throw new BadRequestException('Consultation has already started or ended');
    }

    return this.prismaService.consultation.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  async end(id: string, notes?: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
      throw new BadRequestException('Consultation has already ended');
    }

    return this.prismaService.consultation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        notes,
      },
    });
  }

  async cancel(id: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    if (consultation.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed consultation');
    }

    return this.prismaService.consultation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endedAt: new Date(),
      },
    });
  }

  async updateRecording(id: string, recordingUrl: string) {
    return this.prismaService.consultation.update({
      where: { id },
      data: { recordingUrl },
    });
  }

  async addNotes(id: string, notes: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    const existingNotes = consultation.notes || '';
    const newNotes = existingNotes
      ? `${existingNotes}\n\n[${new Date().toISOString()}]\n${notes}`
      : `[${new Date().toISOString()}]\n${notes}`;

    return this.prismaService.consultation.update({
      where: { id },
      data: { notes: newNotes },
    });
  }
}
