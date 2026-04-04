import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicineDto, AddStockDto, UpdateStockDto } from './dto';

@Injectable()
export class MedicineService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMedicineDto: CreateMedicineDto) {
    return this.prismaService.medicine.create({
      data: createMedicineDto,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    category?: string;
    search?: string;
    requiresPrescription?: boolean;
  }) {
    const { skip = 0, take = 20, category, search, requiresPrescription } = params;

    const where: any = {};
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (requiresPrescription !== undefined) {
      where.requiredPrescription = requiresPrescription;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [medicines, total] = await Promise.all([
      this.prismaService.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prismaService.medicine.count({ where }),
    ]);

    return {
      data: medicines,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const medicine = await this.prismaService.medicine.findUnique({
      where: { id },
      include: {
        stocks: {
          where: { isAvailable: true },
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }

    return medicine;
  }

  async getStock(medicineId: string, pharmacyId: string) {
    const stock = await this.prismaService.medicineStock.findUnique({
      where: {
        medicineId_pharmacyId: {
          medicineId,
          pharmacyId,
        },
      },
      include: {
        medicine: true,
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return stock;
  }

  async searchByPharmacy(
    pharmacyId: string,
    params: {
      skip?: number;
      take?: number;
      search?: string;
      category?: string;
      inStockOnly?: boolean;
    },
  ) {
    const { skip = 0, take = 20, search, category, inStockOnly = true } = params;

    const where: any = {
      pharmacyId,
    };

    if (inStockOnly) {
      where.isAvailable = true;
      where.quantity = { gt: 0 };
    }

    if (search || category) {
      where.medicine = {};
      if (search) {
        where.medicine.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { genericName: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (category) {
        where.medicine.category = { contains: category, mode: 'insensitive' };
      }
    }

    const [stocks, total] = await Promise.all([
      this.prismaService.medicineStock.findMany({
        where,
        skip,
        take,
        orderBy: { medicine: { name: 'asc' } },
        include: {
          medicine: true,
        },
      }),
      this.prismaService.medicineStock.count({ where }),
    ]);

    return {
      data: stocks,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async addStock(medicineId: string, addStockDto: AddStockDto) {
    // Verify medicine exists
    const medicine = await this.prismaService.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${medicineId} not found`);
    }

    // Verify pharmacy exists
    const pharmacy = await this.prismaService.pharmacy.findUnique({
      where: { id: addStockDto.pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${addStockDto.pharmacyId} not found`);
    }

    // Check if stock already exists
    const existingStock = await this.prismaService.medicineStock.findUnique({
      where: {
        medicineId_pharmacyId: {
          medicineId,
          pharmacyId: addStockDto.pharmacyId,
        },
      },
    });

    if (existingStock) {
      // Update existing stock
      return this.prismaService.medicineStock.update({
        where: { id: existingStock.id },
        data: {
          quantity: existingStock.quantity + addStockDto.quantity,
          price: addStockDto.price,
          mrp: addStockDto.mrp,
          batchNumber: addStockDto.batchNumber,
          expiryDate: addStockDto.expiryDate ? new Date(addStockDto.expiryDate) : undefined,
        },
        include: {
          medicine: true,
          pharmacy: true,
        },
      });
    }

    // Create new stock
    return this.prismaService.medicineStock.create({
      data: {
        medicineId,
        pharmacyId: addStockDto.pharmacyId,
        batchNumber: addStockDto.batchNumber,
        expiryDate: addStockDto.expiryDate ? new Date(addStockDto.expiryDate) : undefined,
        quantity: addStockDto.quantity,
        price: addStockDto.price,
        mrp: addStockDto.mrp,
      },
      include: {
        medicine: true,
        pharmacy: true,
      },
    });
  }

  async updateStock(medicineId: string, pharmacyId: string, updateStockDto: UpdateStockDto) {
    const stock = await this.prismaService.medicineStock.findUnique({
      where: {
        medicineId_pharmacyId: {
          medicineId,
          pharmacyId,
        },
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return this.prismaService.medicineStock.update({
      where: { id: stock.id },
      data: updateStockDto,
    });
  }

  async hideExpiredStock() {
    // Find all stocks with past expiry dates and hide them
    const result = await this.prismaService.medicineStock.updateMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
        isAvailable: true,
      },
      data: {
        isAvailable: false,
      },
    });

    return { hiddenCount: result.count };
  }

  async getExpiringMedicines(pharmacyId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prismaService.medicineStock.findMany({
      where: {
        pharmacyId,
        isAvailable: true,
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        medicine: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }
}
