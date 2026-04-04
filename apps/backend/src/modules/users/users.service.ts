import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const { role, ...rest } = createUserDto;

    const user = await this.prismaService.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        dateOfBirth: createUserDto.dateOfBirth ? new Date(createUserDto.dateOfBirth) : undefined,
        role: role as UserRole | undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        dateOfBirth: true,
        gender: true,
        avatar: true,
        emailVerified: true,
        otpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create wallet for new user
    await this.prismaService.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: 'USD',
      },
    });

    return user;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }) {
    const { skip = 0, take = 20, role, status, search } = params;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          dateOfBirth: true,
          gender: true,
          avatar: true,
          emailVerified: true,
          otpEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        dateOfBirth: true,
        gender: true,
        avatar: true,
        emailVerified: true,
        otpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        doctor: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        dateOfBirth: true,
        gender: true,
        avatar: true,
        emailVerified: true,
        otpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        dateOfBirth: updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        dateOfBirth: true,
        gender: true,
        avatar: true,
        emailVerified: true,
        otpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prismaService.user.update({
      where: { id },
      data: { status: updateStatusDto.status },
      select: {
        id: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async verifyEmail(userId: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        status: true,
      },
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null, // Force re-login
      },
      select: {
        id: true,
        email: true,
      },
    });
  }
}
