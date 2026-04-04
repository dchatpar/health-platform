import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePharmacyDto, UpdatePharmacyDto } from './dto';

@Injectable()
export class PharmacyService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPharmacyDto: CreatePharmacyDto) {
    const existing = await this.prismaService.pharmacy.findUnique({
      where: { licenseNumber: createPharmacyDto.licenseNumber },
    });

    if (existing) {
      throw new ConflictException('Pharmacy with this license number already exists');
    }

    return this.prismaService.pharmacy.create({
      data: createPharmacyDto,
    });
  }

  async findAll(params: { skip?: number; take?: number; isActive?: boolean; search?: string }) {
    const { skip = 0, take = 20, isActive, search } = params;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pharmacies, total] = await Promise.all([
      this.prismaService.pharmacy.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.pharmacy.count({ where }),
    ]);

    return {
      data: pharmacies,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const pharmacy = await this.prismaService.pharmacy.findUnique({
      where: { id },
      include: {
        medicines: {
          where: { isAvailable: true },
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${id} not found`);
    }

    return pharmacy;
  }

  async update(id: string, updatePharmacyDto: UpdatePharmacyDto) {
    const pharmacy = await this.prismaService.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${id} not found`);
    }

    return this.prismaService.pharmacy.update({
      where: { id },
      data: updatePharmacyDto,
    });
  }

  async delete(id: string) {
    const pharmacy = await this.prismaService.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${id} not found`);
    }

    // Soft delete - just mark as inactive
    return this.prismaService.pharmacy.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
