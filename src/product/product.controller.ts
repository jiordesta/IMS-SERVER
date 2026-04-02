import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO, UpdateProductDTO } from './product.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() createProductDTO: CreateProductDTO,
    @Request() req: any,
  ) {
    return await this.productService.createProduct(createProductDTO, req.user);
  }

  @Get('fetchall')
  async fetchAllProducts() {
    return await this.productService.fetchAllProducts();
  }

  @Delete('delete/:productId')
  async singleDelete(@Param('productId', ParseIntPipe) productId: number) {
    return await this.productService.deleteProduct([productId]);
  }

  @Delete('delete')
  async bulkDelete(@Query('productIds') productIds: any) {
    const parsed = productIds.split(',').map(Number);
    return await this.productService.deleteProduct(parsed);
  }

  @Patch('update/:productId')
  async updateProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateProductDTO: UpdateProductDTO,
  ) {
    return await this.productService.updateProduct(productId, updateProductDTO);
  }
}
