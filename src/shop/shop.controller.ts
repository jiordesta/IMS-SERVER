import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateShopDTO } from './shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('fetchall')
  @UseGuards(JwtAuthGuard)
  async fetchAllShops(@Request() req: any) {
    return await this.shopService.fetchAllShops(req.user);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createNewShop(
    @Body() createShopDTO: CreateShopDTO,
    @Request() req: any,
  ) {
    return await this.shopService.createNewShop(createShopDTO, req.user);
  }
}
