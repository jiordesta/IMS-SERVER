import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDeliveryDetailsData } from './delivery.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { isUserAuthorized } from 'src/libs/utils/validation';
import { Roles } from 'src/libs/enums';
import { prisma } from '../libs/db/client';
import { formatDate } from 'src/libs/utils/helper';

@Injectable()
export class DeliveryService {
  constructor(private readonly prismaService: PrismaService) {}

  async createDelivery(deliveryDetails: CreateDeliveryDetailsData, user: any) {
    try {
      const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
      if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

      const product = await prisma.product.findUnique({
        where: {
          id: deliveryDetails.productId,
        },
      });

      if (!product) throw new BadRequestException('Product is Required');
      if (deliveryDetails.quantity <= 0)
        throw new BadRequestException('Invalid Quantity');

      return await this.prismaService.$transaction(async (transaction) => {
        const delivery = await transaction.delivery.create({});

        await transaction.deliveryDetails.create({
          data: {
            deliveryId: delivery.id,
            productId: deliveryDetails.productId,
            quantity: deliveryDetails.quantity,
            deliveryDate: deliveryDetails.deliveryDate,
            brand: deliveryDetails?.brand || '',
          },
        });

        await transaction.item.create({
          data: {
            productId: deliveryDetails.productId,
            quantity: deliveryDetails.quantity,
          },
        });

        const createdDelivery = await transaction.delivery.findUnique({
          where: { id: delivery.id },
          include: {
            deliveryDetails: {
              include: {
                product: {
                  include: {
                    productDetails: true,
                  },
                },
              },
            },
          },
        });

        return {
          ...createdDelivery,
          deliveryDetails: createdDelivery.deliveryDetails ?? null,
          productDetails:
            createdDelivery.deliveryDetails?.product?.productDetails ?? null,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async fetchAllDeliveries(user: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);

    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      const deliveries = await prisma.delivery.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          deliveryDetails: {
            include: {
              product: {
                include: {
                  productDetails: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return deliveries.map((delivery) => {
        return {
          id: delivery.id,
          createdAt: delivery.createdAt,
          isDeleted: delivery.isDeleted,
          deliveryDetails: delivery.deliveryDetails ?? null,
          productDetails:
            delivery.deliveryDetails?.product?.productDetails ?? null,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
