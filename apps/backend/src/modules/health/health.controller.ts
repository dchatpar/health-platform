import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import checkDiskSpace from 'check-disk-space';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Basic health check' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('live')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe - is the app running?' })
  checkLive(): Promise<HealthCheckResult> {
    return this.health.check([() => Promise.resolve({ app: { status: 'up' } })]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe - can the app accept traffic?' })
  async checkReady(): Promise<HealthCheckResult> {
    return this.health.check([
      // Check database connection
      () => this.prisma.pingCheck('database', this.prismaService),

      // Check Redis (if configured)
      async (): Promise<HealthIndicatorResult> => {
        const redisHost = this.configService.get('REDIS_HOST', 'localhost');
        const redisPort = this.configService.get('REDIS_PORT', 6379);

        try {
          // Simple TCP check for Redis
          const redis = new Redis({
            host: redisHost,
            port: redisPort,
            lazyConnect: true,
            connectTimeout: 5000,
          });

          await redis.ping();
          redis.disconnect();

          return { redis: { status: 'up' } };
        } catch (error) {
          return { redis: { status: 'down', message: (error as Error).message } };
        }
      },
    ]);
  }

  @Get('detailed')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Detailed health check with all indicators' })
  async checkDetailed(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database
      () => this.prisma.pingCheck('database', this.prismaService),

      // Memory heap
      async (): Promise<HealthIndicatorResult> => {
        const usage = process.memoryUsage();
        const heapUsed = Math.round(usage.heapUsed / 1024 / 1024);
        const heapTotal = Math.round(usage.heapTotal / 1024 / 1024);

        return {
          memory: {
            status: heapUsed < heapTotal * 0.9 ? 'up' : 'down',
            heapUsed: `${heapUsed}MB`,
            heapTotal: `${heapTotal}MB`,
          },
        };
      },

      // Disk space
      async (): Promise<HealthIndicatorResult> => {
        try {
          const diskSpace = await checkDiskSpace('/');
          return {
            disk: {
              status: diskSpace.free > 1024 * 1024 * 1024 ? 'up' : 'down',
              free: `${Math.round(diskSpace.free / 1024 / 1024)}MB`,
              total: `${Math.round(diskSpace.size / 1024 / 1024)}MB`,
            },
          };
        } catch {
          return { disk: { status: 'down' } };
        }
      },
    ]);
  }

  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Simple ping endpoint' })
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
