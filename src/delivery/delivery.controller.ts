import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDetailsDTO } from './delivery.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createDelivery(
    @Body() deliveryDetailsDTO: CreateDeliveryDetailsDTO,
    @Request() req: any,
  ) {
    return await this.deliveryService.createDelivery(
      deliveryDetailsDTO,
      req.user,
    );
  }

  @Get('/fetchall')
  @UseGuards(JwtAuthGuard)
  async fetchAllDeliveries(@Request() req: any) {
    return await this.deliveryService.fetchAllDeliveries(req.user);
  }
}
