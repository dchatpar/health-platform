import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { SearchDoctorDto, UpdateDoctorDto, CreateDoctorProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('doctors')
@Controller({ path: 'doctors', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post('profile')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create doctor profile (Doctor or Admin only)' })
  async createProfile(@Body() createDoctorProfileDto: CreateDoctorProfileDto) {
    return this.doctorsService.createDoctorProfile(createDoctorProfileDto);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search doctors with filters' })
  @ApiQuery({ name: 'specialty', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minExperience', required: false, type: Number })
  @ApiQuery({ name: 'maxExperience', required: false, type: Number })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'consultationFeeMin', required: false, type: Number })
  @ApiQuery({ name: 'consultationFeeMax', required: false, type: Number })
  @ApiQuery({ name: 'availableToday', required: false, type: Boolean })
  @ApiQuery({ name: 'dayOfWeek', required: false, type: Number })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async search(@Query() searchDoctorDto: SearchDoctorDto) {
    return this.doctorsService.search(searchDoctorDto);
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get current doctor profile' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.doctorsService.findByUserId(userId);
  }

  @Get('me/availability')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Get current doctor availability' })
  async getMyAvailability(@CurrentUser('id') userId: string) {
    const doctor = await this.doctorsService.findByUserId(userId);
    return this.doctorsService.getAvailability(doctor.id);
  }

  @Patch('me/availability')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Set current doctor availability' })
  async setMyAvailability(
    @CurrentUser('id') userId: string,
    @Body()
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>,
  ) {
    const doctor = await this.doctorsService.findByUserId(userId);
    return this.doctorsService.setAvailability(doctor.id, availability);
  }

  @Patch('me/profile')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Update current doctor profile' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    const doctor = await this.doctorsService.findByUserId(userId);
    return this.doctorsService.update(doctor.id, updateDoctorDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get doctor by ID' })
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Get doctor by user ID' })
  async findByUserId(@Param('userId') userId: string) {
    return this.doctorsService.findByUserId(userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update doctor by ID (Admin only)' })
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, updateDoctorDto);
  }

  @Get(':id/availability')
  @Public()
  @ApiOperation({ summary: 'Get doctor availability' })
  async getAvailability(@Param('id') id: string) {
    return this.doctorsService.getAvailability(id);
  }

  @Patch(':id/availability')
  @Roles(Role.DOCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Set doctor availability' })
  async setAvailability(
    @Param('id') id: string,
    @Body()
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>,
  ) {
    return this.doctorsService.setAvailability(id, availability);
  }
}
