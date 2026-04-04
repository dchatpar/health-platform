import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchDoctorDto, UpdateDoctorDto, CreateDoctorProfileDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createDoctorProfile(createDoctorProfileDto: CreateDoctorProfileDto) {
    const existingDoctor = await this.prismaService.doctor.findUnique({
      where: { userId: createDoctorProfileDto.userId },
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor profile already exists for this user');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: createDoctorProfileDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createDoctorProfileDto.userId} not found`);
    }

    if (user.role !== 'DOCTOR') {
      throw new ConflictException('User must have DOCTOR role');
    }

    return this.prismaService.doctor.create({
      data: {
        userId: createDoctorProfileDto.userId,
        specialty: createDoctorProfileDto.specialty,
        qualifications: createDoctorProfileDto.qualifications,
        experienceYears: createDoctorProfileDto.experienceYears,
        bio: createDoctorProfileDto.bio,
        consultationFee: createDoctorProfileDto.consultationFee,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        availability: true,
      },
    });
  }

  async search(params: SearchDoctorDto) {
    const {
      specialty,
      search,
      minExperience,
      maxExperience,
      minRating,
      consultationFeeMin,
      consultationFeeMax,
      availableToday,
      dayOfWeek,
      skip = 0,
      take = 20,
    } = params;

    const where: Prisma.DoctorWhereInput = {};

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    if (minExperience !== undefined || maxExperience !== undefined) {
      where.experienceYears = {};
      if (minExperience !== undefined) {
        where.experienceYears.gte = minExperience;
      }
      if (maxExperience !== undefined) {
        where.experienceYears.lte = maxExperience;
      }
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (consultationFeeMin !== undefined || consultationFeeMax !== undefined) {
      where.consultationFee = {};
      if (consultationFeeMin !== undefined) {
        where.consultationFee.gte = consultationFeeMin;
      }
      if (consultationFeeMax !== undefined) {
        where.consultationFee.lte = consultationFeeMax;
      }
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { specialty: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If searching for available today or specific day
    if (availableToday || dayOfWeek !== undefined) {
      const targetDay = dayOfWeek ?? new Date().getDay();
      where.availability = {
        some: {
          dayOfWeek: targetDay,
          isAvailable: true,
        },
      };
    }

    const [doctors, total] = await Promise.all([
      this.prismaService.doctor.findMany({
        where,
        skip,
        take,
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }, { experienceYears: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
          availability: {
            where: dayOfWeek !== undefined ? { dayOfWeek } : undefined,
          },
        },
      }),
      this.prismaService.doctor.count({ where }),
    ]);

    return {
      data: doctors,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  async findByUserId(userId: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        availability: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor profile for user ${userId} not found`);
    }

    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return this.prismaService.doctor.update({
      where: { id },
      data: updateDoctorDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getAvailability(doctorId: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: doctorId },
      include: {
        availability: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    return doctor.availability;
  }

  async setAvailability(
    doctorId: string,
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>,
  ) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Delete existing availability and create new ones
    await this.prismaService.doctorAvailability.deleteMany({
      where: { doctorId },
    });

    const created = await this.prismaService.doctorAvailability.createMany({
      data: availability.map((slot) => ({
        doctorId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable ?? true,
      })),
    });

    return this.getAvailability(doctorId);
  }

  async updateRating(doctorId: string, newRating: number) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Calculate new average rating
    const totalRating = (doctor.rating?.toNumber() ?? 0) * doctor.reviewCount + newRating;
    const newReviewCount = doctor.reviewCount + 1;
    const averageRating = totalRating / newReviewCount;

    return this.prismaService.doctor.update({
      where: { id: doctorId },
      data: {
        rating: averageRating,
        reviewCount: newReviewCount,
      },
    });
  }

  async deleteDoctorProfile(userId: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor profile for user ${userId} not found`);
    }

    await this.prismaService.doctor.delete({
      where: { userId },
    });

    return { message: 'Doctor profile deleted successfully' };
  }
}
