import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateDeliveryDetailsData,
  UpdateDeliveryDetailsData,
} from './delivery.type';
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

  async updateDelivery(
    deliveryId: number,
    updateDeliveryData: UpdateDeliveryDetailsData,
    user: any,
  ) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      await this.prismaService.$transaction(async (transaction) => {
        let actions: any[] = [];

        const delivery = await transaction.delivery.findUnique({
          where: {
            id: deliveryId,
            isDeleted: false,
          },
          include: {
            deliveryDetails: true,
          },
        });

        const prevQuanity = delivery.deliveryDetails.quantity;
        const newQuanity = updateDeliveryData.quantity;

        if (prevQuanity !== newQuanity) {
          const items = await transaction.item.findMany({
            where: {
              productId: delivery.deliveryDetails.productId,
              isDeleted: false,
            },
          });

          console.log(items);

          if (items.length === 0 || newQuanity > prevQuanity) {
            actions.push(
              transaction.item.create({
                data: {
                  productId: delivery.deliveryDetails.productId,
                  quantity: newQuanity - prevQuanity,
                },
              }),
            );
          } else if (newQuanity < prevQuanity) {
            let balance = prevQuanity - newQuanity;

            for (const item of items) {
              if (item.quantity >= balance) {
                actions.push(
                  transaction.item.update({
                    where: {
                      id: item.id,
                    },
                    data: {
                      quantity: item.quantity - balance,
                    },
                  }),
                );

                balance = 0;
              } else {
                actions.push(
                  transaction.item.update({
                    where: {
                      id: item.id,
                    },
                    data: {
                      quantity: 0,
                      isDeleted: true,
                    },
                  }),
                );

                balance = balance - item.quantity;
              }

              if (balance === 0) break;
            }

            if (balance > 0) {
              throw new Error('Somethings not right: Please Double Check');
            }
          }
        }

        actions.push(
          transaction.deliveryDetails.update({
            where: {
              deliveryId: delivery.id,
            },
            data: updateDeliveryData,
          }),
        );

        await Promise.all(actions);
      });

      const response = await prisma.delivery.findUnique({
        where: {
          id: deliveryId,
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
      });

      return {
        ...response,
        productDetails:
          response?.deliveryDetails?.product?.productDetails ?? null,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
