import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, OtpDto, VerifyOtpDto, RefreshTokenDto } from './dto';
import { UserRole, UserStatus } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserWithTokens extends AuthTokens {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    otpEnabled: boolean;
    doctor?: any;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpCooldowns = new Map<string, number>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserWithTokens> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: registerDto.role || UserRole.PATIENT,
        status: UserStatus.PENDING_VERIFICATION,
        dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : undefined,
        gender: registerDto.gender,
      },
      include: {
        doctor: true,
        wallet: true,
      },
    });

    // Create wallet for new user
    if (!user.wallet) {
      await this.prismaService.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          currency: 'USD',
        },
      });
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto): Promise<UserWithTokens> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
      include: {
        doctor: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.otpEnabled) {
      // Return a temporary token indicating 2FA is needed
      const tempToken = this.jwtService.sign(
        { sub: user.id, email: user.email, requires2FA: true },
        { expiresIn: '5m' },
      );

      return {
        accessToken: tempToken,
        refreshToken: '',
        expiresIn: 300,
        user: this.sanitizeUser(user),
      };
    }

    // Update last login
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<UserWithTokens> {
    const user = await this.prismaService.user.findUnique({
      where: { email: verifyOtpDto.email },
      include: {
        doctor: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.otpSecret) {
      throw new BadRequestException('OTP not enabled for this user');
    }

    const isValid = authenticator.verify({
      token: verifyOtpDto.code,
      secret: user.otpSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Update OTP last used
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { otpLastUsed: new Date() },
    });

    // Update last login
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async requestOtp(otpDto: OtpDto): Promise<{ message: string; cooldown: number }> {
    const user = await this.prismaService.user.findUnique({
      where: { email: otpDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, an OTP has been sent', cooldown: 60 };
    }

    // Check cooldown (60 seconds)
    const lastSent = this.otpCooldowns.get(otpDto.email);
    const now = Date.now();

    if (lastSent && now - lastSent < 60000) {
      const remaining = Math.ceil((60000 - (now - lastSent)) / 1000);
      throw new BadRequestException(
        `Please wait ${remaining} seconds before requesting another OTP`,
      );
    }

    // Generate and save OTP secret if enabling 2FA
    if (otpDto.type === 'ENABLE_2FA' && !user.otpEnabled) {
      const otpSecret = authenticator.generateSecret();
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { otpSecret },
      });
    }

    // In production, send email/SMS here
    // For development only - log the OTP (remove in production!)
    if (this.configService.get('NODE_ENV') !== 'production' && user.otpSecret) {
      this.logger.debug(`OTP for ${otpDto.email}: ${authenticator.generate(user.otpSecret)}`);
    }

    // Set cooldown
    this.otpCooldowns.set(otpDto.email, now);

    return { message: 'If the email exists, an OTP has been sent', cooldown: 60 };
  }

  async enable2FA(userId: string, code: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.otpEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // If no secret exists, generate one
    let secret = user.otpSecret;
    if (!secret) {
      secret = authenticator.generateSecret();
      await this.prismaService.user.update({
        where: { id: userId },
        data: { otpSecret: secret },
      });
    }

    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { otpEnabled: true },
    });

    const qrCode = authenticator.keyuri(user.email, 'HealthcareApp', secret);

    return { secret, qrCode };
  }

  async disable2FA(userId: string, code: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.otpEnabled || !user.otpSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isValid = authenticator.verify({ token: code, secret: user.otpSecret });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { otpEnabled: false, otpSecret: null },
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    // Store refresh token in database
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '15m');
    const expiresInMs = this.parseExpiresIn(expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInMs,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // 15 minutes default

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  private sanitizeUser(user: any) {
    const { password, otpSecret, refreshToken, ...result } = user;
    return result;
  }
}
