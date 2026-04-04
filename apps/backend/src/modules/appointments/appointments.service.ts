import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SlotLockService } from './slot-lock.service';
import { CreateAppointmentDto, CancelAppointmentDto } from './dto';
import { AppointmentStatus, Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly CANCEL_WINDOW_HOURS = 12;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly slotLockService: SlotLockService,
  ) {}

  async create(patientId: string, createAppointmentDto: CreateAppointmentDto) {
    const { doctorId, scheduledAt, duration, reason, notes } = createAppointmentDto;

    const appointmentTime = new Date(scheduledAt);

    // Check if appointment is in the future
    if (appointmentTime <= new Date()) {
      throw new BadRequestException('Cannot book appointments in the past');
    }

    // Check if doctor exists
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Check if slot is already booked
    const existingAppointment = await this.prismaService.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt: appointmentTime,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (existingAppointment) {
      throw new ConflictException('This time slot is already booked');
    }

    // Try to acquire slot lock
    const lockAcquired = await this.slotLockService.acquireLock(
      doctorId,
      appointmentTime,
      patientId,
    );

    if (!lockAcquired) {
      throw new ConflictException('This slot is currently being booked by another user');
    }

    try {
      // Create the appointment
      const appointment = await this.prismaService.appointment.create({
        data: {
          patientId,
          doctorId,
          scheduledAt: appointmentTime,
          duration: duration ?? 30,
          reason,
          notes,
          status: AppointmentStatus.SCHEDULED,
          slotLockedAt: new Date(),
          slotLockedBy: patientId,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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
      });

      // Release lock after booking is complete (keep lock during booking process)
      await this.slotLockService.releaseLock(doctorId, appointmentTime, patientId);

      return appointment;
    } catch (error) {
      // Release lock on error
      await this.slotLockService.releaseLock(doctorId, appointmentTime, patientId);
      throw error;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    patientId?: string;
    doctorId?: string;
    status?: AppointmentStatus;
    fromDate?: string;
    toDate?: string;
  }) {
    const { skip = 0, take = 20, patientId, doctorId, status, fromDate, toDate } = params;

    const where: Prisma.AppointmentWhereInput = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.scheduledAt = {};
      if (fromDate) {
        where.scheduledAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.scheduledAt.lte = new Date(toDate);
      }
    }

    const [appointments, total] = await Promise.all([
      this.prismaService.appointment.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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
          consultation: true,
          prescription: true,
        },
      }),
      this.prismaService.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
        consultation: true,
        prescription: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findForPatient(
    patientId: string,
    params: {
      skip?: number;
      take?: number;
      status?: AppointmentStatus;
    },
  ) {
    return this.findAll({
      ...params,
      patientId,
    });
  }

  async findForDoctor(
    doctorId: string,
    params: {
      skip?: number;
      take?: number;
      status?: AppointmentStatus;
    },
  ) {
    // First get the doctor record
    const doctor = await this.prismaService.doctor.findUnique({
      where: { userId: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor profile not found for user ${doctorId}`);
    }

    return this.findAll({
      ...params,
      doctorId: doctor.id,
    });
  }

  async confirm(id: string, doctorId: string) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException('You can only confirm your own appointments');
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be confirmed');
    }

    return this.prismaService.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
    });
  }

  async cancel(id: string, userId: string, cancelAppointmentDto: CancelAppointmentDto) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Check if user is authorized to cancel
    const isPatient = appointment.patientId === userId;
    const isDoctor = appointment.doctor?.userId === userId;
    const isAdmin = false; // Would check user role here

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('You are not authorized to cancel this appointment');
    }

    // Check if appointment can be cancelled
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    // Check 12-hour policy
    const hoursUntilAppointment =
      (appointment.scheduledAt.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < this.CANCEL_WINDOW_HOURS && !isDoctor) {
      throw new BadRequestException(
        `Cannot cancel within ${this.CANCEL_WINDOW_HOURS} hours of appointment`,
      );
    }

    return this.prismaService.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: cancelAppointmentDto.reason,
      },
    });
  }

  async complete(id: string, doctorId: string, diagnosis?: string) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException('You can only complete your own appointments');
    }

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException('Only confirmed or in-progress appointments can be completed');
    }

    return this.prismaService.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.COMPLETED,
        diagnosis,
      },
    });
  }

  async markNoShow(id: string, doctorId: string) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException('You can only mark your own appointments');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed appointments can be marked as no-show');
    }

    return this.prismaService.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.NO_SHOW },
    });
  }

  async getAvailableSlots(doctorId: string, date: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: doctorId },
      include: {
        availability: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get doctor's availability for this day
    const dayAvailability = doctor.availability.find(
      (a) => a.dayOfWeek === dayOfWeek && a.isAvailable,
    );

    if (!dayAvailability) {
      return { slots: [] };
    }

    // Get existing appointments for this day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prismaService.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Get locked slots from Redis
    const lockedSlots = await this.slotLockService.getLockedSlots(doctorId, targetDate);

    // Generate all possible slots
    const slots: Array<{
      time: string;
      available: boolean;
      locked: boolean;
    }> = [];

    const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);

    const currentTime = new Date(targetDate);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().substring(0, 5);
      const slotTime = new Date(currentTime);

      // Check if slot is in the past
      if (slotTime > new Date()) {
        // Check if slot is booked
        const isBooked = existingAppointments.some((apt) => {
          const aptTime = new Date(apt.scheduledAt);
          return aptTime.getTime() === slotTime.getTime();
        });

        // Check if slot is locked
        const isLocked = lockedSlots.includes(timeStr);

        slots.push({
          time: timeStr,
          available: !isBooked && !isLocked,
          locked: isLocked,
        });
      }

      // Move to next slot (30 minutes)
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return {
      date,
      doctorId,
      availability: dayAvailability,
      slots,
    };
  }
}
