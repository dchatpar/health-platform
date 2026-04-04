import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto';
import { PrescriptionStatus } from '@prisma/client';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(doctorId: string, createPrescriptionDto: CreatePrescriptionDto) {
    // Verify patient exists
    const patient = await this.prismaService.user.findUnique({
      where: { id: createPrescriptionDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${createPrescriptionDto.patientId} not found`);
    }

    // Calculate validity period (default 6 months)
    const validUntil = createPrescriptionDto.validUntil
      ? new Date(createPrescriptionDto.validUntil)
      : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months

    const prescription = await this.prismaService.prescription.create({
      data: {
        patientId: createPrescriptionDto.patientId,
        doctorId,
        appointmentId: createPrescriptionDto.appointmentId,
        medications: createPrescriptionDto.medications,
        diagnosis: createPrescriptionDto.diagnosis,
        notes: createPrescriptionDto.notes,
        validFrom: new Date(),
        validUntil,
        status: PrescriptionStatus.ACTIVE,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return prescription;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    patientId?: string;
    doctorId?: string;
    status?: PrescriptionStatus;
  }) {
    const { skip = 0, take = 20, patientId, doctorId, status } = params;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    const [prescriptions, total] = await Promise.all([
      this.prismaService.prescription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prismaService.prescription.count({ where }),
    ]);

    return {
      data: prescriptions,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const prescription = await this.prismaService.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledAt: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async findForPatient(
    patientId: string,
    params: { skip?: number; take?: number; activeOnly?: boolean },
  ) {
    const { skip = 0, take = 20, activeOnly } = params;

    const where: any = { patientId };
    if (activeOnly) {
      where.status = PrescriptionStatus.ACTIVE;
      where.validUntil = { gte: new Date() };
    }

    return this.findAll({ ...params, patientId });
  }

  async findForDoctor(doctorId: string, params: { skip?: number; take?: number }) {
    return this.findAll({ ...params, doctorId });
  }

  async cancel(id: string, doctorId: string) {
    const prescription = await this.prismaService.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.doctorId !== doctorId) {
      throw new BadRequestException('Only the prescribing doctor can cancel this prescription');
    }

    if (prescription.status === PrescriptionStatus.CANCELLED) {
      throw new BadRequestException('Prescription is already cancelled');
    }

    if (prescription.status === PrescriptionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed prescription');
    }

    return this.prismaService.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.CANCELLED },
    });
  }

  async complete(id: string) {
    const prescription = await this.prismaService.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    if (prescription.status !== PrescriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active prescriptions can be completed');
    }

    return this.prismaService.prescription.update({
      where: { id },
      data: { status: PrescriptionStatus.COMPLETED },
    });
  }

  async generatePdf(id: string): Promise<Buffer> {
    const prescription = await this.findOne(id);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('PRESCRIPTION', { align: 'center' });
      doc.moveDown();

      // Prescription details
      doc.fontSize(10).font('Helvetica');
      doc.text(`Prescription #: ${prescription.id}`);
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
      doc.text(`Valid Until: ${new Date(prescription.validUntil!).toLocaleDateString()}`);
      doc.moveDown();

      // Patient info
      doc.font('Helvetica-Bold').text('PATIENT INFORMATION');
      doc
        .font('Helvetica')
        .text(`Name: ${prescription.patient.firstName} ${prescription.patient.lastName}`);
      doc.text(`Email: ${prescription.patient.email}`);
      if (prescription.patient.dateOfBirth) {
        doc.text(
          `Date of Birth: ${new Date(prescription.patient.dateOfBirth).toLocaleDateString()}`,
        );
      }
      doc.moveDown();

      // Doctor info
      doc.font('Helvetica-Bold').text('PRESCRIBING PHYSICIAN');
      doc
        .font('Helvetica')
        .text(`Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}`);
      doc.text(`Email: ${prescription.doctor.email}`);
      doc.moveDown();

      // Diagnosis
      if (prescription.diagnosis) {
        doc.font('Helvetica-Bold').text('DIAGNOSIS');
        doc.font('Helvetica').text(prescription.diagnosis);
        doc.moveDown();
      }

      // Medications
      doc.font('Helvetica-Bold').text('MEDICATIONS');
      doc.moveDown(0.5);

      const medications = prescription.medications as any[];
      medications.forEach((med, index) => {
        doc.font('Helvetica-Bold').text(`${index + 1}. ${med.name}`);
        doc.font('Helvetica');
        doc.text(`   Dosage: ${med.dosage}`);
        doc.text(`   Frequency: ${med.frequency}`);
        doc.text(`   Duration: ${med.duration}`);
        doc.text(`   Quantity: ${med.quantity}`);
        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`);
        }
        doc.moveDown(0.5);
      });

      // Notes
      if (prescription.notes) {
        doc.moveDown();
        doc.font('Helvetica-Bold').text('ADDITIONAL NOTES');
        doc.font('Helvetica').text(prescription.notes);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text('This is a digital prescription generated by Healthcare Platform.', {
        align: 'center',
      });
      doc.text('Please consult your healthcare provider for any questions.', { align: 'center' });

      doc.end();
    });
  }

  async checkValidity(id: string) {
    const prescription = await this.prismaService.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    const now = new Date();
    const isValid =
      prescription.status === PrescriptionStatus.ACTIVE &&
      prescription.validUntil &&
      prescription.validUntil >= now;

    return {
      id: prescription.id,
      isValid,
      status: prescription.status,
      validUntil: prescription.validUntil,
      reason: isValid
        ? undefined
        : prescription.status !== PrescriptionStatus.ACTIVE
          ? `Prescription is ${prescription.status.toLowerCase()}`
          : 'Prescription has expired',
    };
  }
}
