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
import { PharmacyService } from './pharmacy.service';
import { MedicineService } from './medicine.service';
import { OrderService } from './order.service';
import {
  CreatePharmacyDto,
  UpdatePharmacyDto,
  CreateMedicineDto,
  AddStockDto,
  UpdateStockDto,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderStatus } from '@prisma/client';

@ApiTags('pharmacy')
@Controller({ path: 'pharmacy', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PharmacyController {
  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly medicineService: MedicineService,
    private readonly orderService: OrderService,
  ) {}

  // Pharmacy endpoints
  @Post('pharmacies')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new pharmacy (Admin only)' })
  async createPharmacy(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }

  @Get('pharmacies')
  @ApiOperation({ summary: 'Get all pharmacies' })
  async findAllPharmacies(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    return this.pharmacyService.findAll({ skip, take, isActive, search });
  }

  @Get('pharmacies/:id')
  @ApiOperation({ summary: 'Get pharmacy by ID' })
  async findPharmacy(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Patch('pharmacies/:id')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Update pharmacy' })
  async updatePharmacy(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmacyService.update(id, updatePharmacyDto);
  }

  // Medicine endpoints
  @Post('medicines')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new medicine' })
  async createMedicine(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicineService.create(createMedicineDto);
  }

  @Get('medicines')
  @ApiOperation({ summary: 'Get all medicines' })
  async findAllMedicines(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('requiresPrescription') requiresPrescription?: boolean,
  ) {
    return this.medicineService.findAll({ skip, take, category, search, requiresPrescription });
  }

  @Get('medicines/:id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  async findMedicine(@Param('id') id: string) {
    return this.medicineService.findOne(id);
  }

  @Post('medicines/:id/stock')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add stock for a medicine' })
  async addStock(@Param('id') medicineId: string, @Body() addStockDto: AddStockDto) {
    return this.medicineService.addStock(medicineId, addStockDto);
  }

  @Get('pharmacies/:pharmacyId/stock')
  @ApiOperation({ summary: 'Get medicine stock for a pharmacy' })
  async getPharmacyStock(
    @Param('pharmacyId') pharmacyId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('inStockOnly') inStockOnly?: boolean,
  ) {
    return this.medicineService.searchByPharmacy(pharmacyId, {
      skip,
      take,
      search,
      category,
      inStockOnly,
    });
  }

  @Patch('medicines/:medicineId/stock/:pharmacyId')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Update medicine stock' })
  async updateStock(
    @Param('medicineId') medicineId: string,
    @Param('pharmacyId') pharmacyId: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.medicineService.updateStock(medicineId, pharmacyId, updateStockDto);
  }

  @Get('medicines/expiring')
  @ApiOperation({ summary: 'Get expiring medicines' })
  async getExpiringMedicines(
    @Query('pharmacyId') pharmacyId: string,
    @Query('daysAhead') daysAhead?: number,
  ) {
    return this.medicineService.getExpiringMedicines(pharmacyId, daysAhead);
  }

  @Post('hide-expired')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Hide expired medicines' })
  async hideExpiredStock() {
    return this.medicineService.hideExpiredStock();
  }

  // Order endpoints
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(@CurrentUser('id') userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(userId, createOrderDto);
  }

  @Get('orders/my')
  @ApiOperation({ summary: 'Get my orders' })
  async getMyOrders(
    @CurrentUser('id') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.findForPatient(userId, { skip, take, status });
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOrder(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get('orders/:id/summary')
  @ApiOperation({ summary: 'Get order summary' })
  async getOrderSummary(@Param('id') id: string) {
    return this.orderService.getOrderSummary(id);
  }

  @Patch('orders/:id/status')
  @Roles(Role.ADMIN, Role.PHARMACIST)
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateStatusDto, userId);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.orderService.cancel(id, userId);
  }

  @Patch('orders/:id/payment')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Process payment for order' })
  async processPayment(@Param('id') id: string, @Body('paymentId') paymentId: string) {
    return this.orderService.processPayment(id, paymentId);
  }
}
