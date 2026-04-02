import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductData, UpdateProductData } from './product.type';
import { Roles } from 'src/libs/enums';
import { prisma } from '../libs/db/client';
import { isUserAuthorized } from 'src/libs/utils/validation';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProduct(createProductData: CreateProductData, user: any) {
    try {
      const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
      if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

      return await this.prismaService.$transaction(async (transaction) => {
        const product = await transaction.product.create({});

        const newProduct = {
          originalName: createProductData.originalName,
          commonName: createProductData.commonName,
          productId: product.id,
        };

        await transaction.productDetails.create({ data: newProduct });

        const response = await transaction.product.findFirst({
          where: {
            isDeleted: false,
            id: product.id,
          },
          include: {
            productDetails: true,
          },
        });

        return response;
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async fetchProductById(productId: number) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          isDeleted: false,
          id: productId,
        },
        include: {
          productDetails: true,
        },
      });

      return product;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async fetchAllProducts() {
    try {
      const products = await prisma.product.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          productDetails: true,
        },
      });

      return products;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteProduct(productIds: number[]) {
    try {
      await prisma.product.updateMany({
        where: {
          id: {
            in: productIds,
          },
        },
        data: {
          isDeleted: true,
        },
      });

      return productIds;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateProduct(productId: number, updateProductData: UpdateProductData) {
    try {
      return await this.prismaService.$transaction(async (transaction) => {
        await transaction.productDetails.update({
          where: {
            productId: productId,
          },
          data: {
            originalName: updateProductData.originalName,
            commonName: updateProductData.commonName,
          },
        });

        const product = await transaction.product.findFirst({
          where: {
            isDeleted: false,
            id: productId,
          },
          include: {
            productDetails: true,
          },
        });

        return product;
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
