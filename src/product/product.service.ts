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

        const priceList = await transaction.priceList.create({
          data: { productId: product.id },
        });

        await transaction.price.create({
          data: {
            priceListId: priceList.id,
            price: createProductData.price || 0.0,
          },
        });

        await transaction.productDetails.create({ data: newProduct });

        const response = await transaction.product.findFirst({
          where: {
            isDeleted: false,
            id: product.id,
          },
          include: {
            productDetails: true,
            priceList: {
              include: {
                price: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        });

        return {
          ...response,
          priceList: response?.priceList
            ? {
                ...response.priceList,
                price: response.priceList.price[0] ?? null,
              }
            : null,
        };
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
          priceList: {
            include: {
              price: {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      });

      return {
        ...product,
        priceList: product?.priceList
          ? {
              ...product.priceList,
              price: product.priceList.price[0] ?? null,
            }
          : null,
      };
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
          priceList: {
            include: {
              price: {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      });

      return products.map((product) => ({
        ...product,
        priceList: product.priceList
          ? {
              ...product.priceList,
              price: product.priceList.price[0] ?? null,
            }
          : null,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteProduct(productId: number) {
    try {
      return await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          isDeleted: true,
        },
      });
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

        const priceList = await transaction.priceList.findFirst({
          where: {
            productId: productId,
          },
          include: {
            price: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        });

        const latestPrice = priceList?.price[0].price;

        if (latestPrice !== updateProductData?.price) {
          await transaction.price.create({
            data: {
              priceListId: priceList.id,
              price: updateProductData.price,
            },
          });
        }

        const product = await transaction.product.findFirst({
          where: {
            isDeleted: false,
            id: productId,
          },
          include: {
            productDetails: true,
            priceList: {
              include: {
                price: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        });

        return {
          ...product,
          priceList: product?.priceList
            ? {
                ...product.priceList,
                price: product.priceList.price[0] ?? null,
              }
            : null,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
