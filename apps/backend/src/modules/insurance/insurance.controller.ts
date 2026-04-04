import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { ClaimService } from './claim.service';
import {
  CreateInsurancePolicyDto,
  UpdateInsurancePolicyDto,
  ProcessClaimDto,
  ReviewClaimDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InsurancePolicyStatus, ClaimStatus } from '@prisma/client';

@ApiTags('insurance')
@Controller({ path: 'insurance', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InsuranceController {
  constructor(
    private readonly insuranceService: InsuranceService,
    private readonly claimService: ClaimService,
  ) {}

  // Policy endpoints
  @Post('policies')
  @Roles(Role.ADMIN, Role.INSURANCE_PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create insurance policy' })
  async createPolicy(@Body() createPolicyDto: CreateInsurancePolicyDto) {
    return this.insuranceService.createPolicy(createPolicyDto);
  }

  @Get('policies')
  @Roles(Role.ADMIN, Role.INSURANCE_PROVIDER)
  @ApiOperation({ summary: 'Get all policies' })
  async findAllPolicies(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('patientId') patientId?: string,
    @Query('status') status?: InsurancePolicyStatus,
  ) {
    return this.insuranceService.findAllPolicies({ skip, take, patientId, status });
  }

  @Get('policies/my')
  @ApiOperation({ summary: 'Get my insurance policies' })
  async getMyPolicies(@CurrentUser('id') userId: string) {
    return this.insuranceService.findPatientPolicies(userId);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get policy by ID' })
  async findPolicy(@Param('id') id: string) {
    return this.insuranceService.findPolicyById(id);
  }

  @Get('policies/number/:policyNumber')
  @ApiOperation({ summary: 'Get policy by number' })
  async findPolicyByNumber(@Param('policyNumber') policyNumber: string) {
    return this.insuranceService.findPolicyByNumber(policyNumber);
  }

  @Patch('policies/:id')
  @Roles(Role.ADMIN, Role.INSURANCE_PROVIDER)
  @ApiOperation({ summary: 'Update policy' })
  async updatePolicy(@Param('id') id: string, @Body() updatePolicyDto: UpdateInsurancePolicyDto) {
    return this.insuranceService.updatePolicy(id, updatePolicyDto);
  }

  @Get('policies/:id/validate')
  @ApiOperation({ summary: 'Validate a policy' })
  async validatePolicy(@Param('id') id: string) {
    return this.insuranceService.validatePolicy(id);
  }

  @Get('policies/:id/coverage/:medicineName')
  @ApiOperation({ summary: 'Check medicine coverage' })
  async checkCoverage(
    @Param('id') id: string,
    @Param('medicineName') medicineName: string,
    @Query('category') category?: string,
  ) {
    return this.insuranceService.checkMedicineCoverage(id, medicineName, category || '');
  }

  // Claim endpoints
  @Post('claims')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process a new claim' })
  async processClaim(@Body() processClaimDto: ProcessClaimDto) {
    return this.claimService.processClaim(processClaimDto);
  }

  @Get('claims')
  @Roles(Role.ADMIN, Role.INSURANCE_PROVIDER)
  @ApiOperation({ summary: 'Get all claims' })
  async findAllClaims(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('policyId') policyId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: ClaimStatus,
  ) {
    return this.claimService.findAllClaims({ skip, take, policyId, orderId, status });
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim by ID' })
  async findClaim(@Param('id') id: string) {
    return this.claimService.findClaimById(id);
  }

  @Get('claims/number/:claimNumber')
  @ApiOperation({ summary: 'Get claim by number' })
  async findClaimByNumber(@Param('claimNumber') claimNumber: string) {
    return this.claimService.findClaimByNumber(claimNumber);
  }

  @Get('claims/:id/summary')
  @ApiOperation({ summary: 'Get claim summary' })
  async getClaimSummary(@Param('id') id: string) {
    return this.claimService.getClaimSummary(id);
  }

  @Patch('claims/review')
  @Roles(Role.ADMIN, Role.INSURANCE_PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review a claim' })
  async reviewClaim(@Body() reviewClaimDto: ReviewClaimDto) {
    return this.claimService.reviewClaim(reviewClaimDto);
  }

  @Post('claims/:id/settle')
  @Roles(Role.ADMIN, Role.INSURANCE_PROVIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Settle an approved claim' })
  async settleClaim(@Param('id') id: string) {
    return this.claimService.settleClaim(id);
  }
}
