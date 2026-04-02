import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Query,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO, UpdateOrderDTO } from './order.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDTO: CreateOrderDTO,
    @Request() req: any,
  ) {
    return await this.orderService.createOrder(createOrderDTO, req.user);
  }

  @Get('fetchall')
  @UseGuards(JwtAuthGuard)
  async fetchOrders(@Query() filters: any, @Request() req: any) {
    return await this.orderService.fetchAll(filters, req.user);
  }

  @Patch('update/:orderId')
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() updateOrderDTO: UpdateOrderDTO,
    @Request() req: any,
  ) {
    return await this.orderService.updateOrder(
      orderId,
      updateOrderDTO,
      req.user,
    );
  }

  @Patch('setasdone')
  @UseGuards(JwtAuthGuard)
  async setOrdersAsDone(@Query('orderIds') orderIds: any, @Request() req: any) {
    const parsed = orderIds.split(',').map(Number);

    return await this.orderService.setOrdersAsDone(req.user, parsed);
  }
}
