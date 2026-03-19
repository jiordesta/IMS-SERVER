import { Injectable, UnauthorizedException } from '@nestjs/common';
import { prisma } from 'src/libs/db/client';
import {
  OrderStatus,
  OrderType,
  Roles,
  TransactionStatus,
} from 'src/libs/enums';
import { isUserAuthorized } from 'src/libs/utils/validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderData, UpdateOrderData } from './order.type';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(createOrderData: CreateOrderData, user: any) {
    try {
      const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
      if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

      return await this.prismaService.$transaction(async (transaction) => {
        const shopExists = await transaction.shop.findFirst({
          where: {
            isDeleted: false,
            id: createOrderData.shopId,
          },
        });

        if (!shopExists) throw new Error('Shop does not exist');

        let dailyTransaction = await transaction.transaction.findFirst({
          where: {
            isDeleted: false,
            shopId: createOrderData.shopId,
            status: TransactionStatus.PENDING,
          },
        });

        let type = OrderType.LOADING;

        if (!dailyTransaction) {
          const prevDailyTransaction = await transaction.transaction.findFirst({
            where: {
              shopId: createOrderData.shopId,
              status: TransactionStatus.COMPLETED,
            },
            orderBy: {
              transactionDate: 'desc',
            },
          });

          let transactionDate = new Date(new Date().setHours(0, 0, 0, 0));

          if (prevDailyTransaction) {
            transactionDate = new Date(
              prevDailyTransaction.transactionDate.getTime() +
                24 * 60 * 60 * 1000,
            );
          }

          dailyTransaction = await transaction.transaction.create({
            data: {
              shopId: createOrderData.shopId,
              status: TransactionStatus.PENDING,
              transactionDate,
            },
          });
        } else {
          type = OrderType.PAHABOL;
        }

        const order = await transaction.order.create({
          data: {
            transactionId: dailyTransaction.id,
          },
        });

        await transaction.orderDetails.create({
          data: {
            orderId: order.id,
            orderDate: createOrderData.orderDate,
            shopId: createOrderData.shopId,
            type: type,
            status: OrderStatus.PENDING,
          },
        });

        for (const item of createOrderData.items) {
          if (item.quantity > 0)
            await transaction.orderItem.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
              },
            });
        }
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error.message);
    }
  }

  async fetchOrdersByDate(date: Date, user: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      const orders = await prisma.order.findMany({
        where: {
          isDeleted: false,
          orderDetails: {
            orderDate: {
              gte: date,
              lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        orderBy: {
          orderDetails: {
            orderDate: 'desc',
          },
        },
        include: {
          orderItem: {
            include: {
              product: {
                include: {
                  productDetails: true,
                },
              },
            },
          },
          orderDetails: {
            include: {
              shop: {
                include: {
                  shopDetails: true,
                },
              },
            },
          },
        },
      });

      return orders.map((order) => ({
        id: order.id,
        status: order.orderDetails?.status,
        type: order.orderDetails?.type,
        orderDetails: order.orderDetails,
        orderItems: order?.orderItem,
        shopDetails: order?.orderDetails?.shop?.shopDetails,
        totalItems: order?.orderItem
          ?.map((item) => item.quantity)
          .reduce((a, b) => a + b, 0),
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateOrder(
    orderId: number,
    updateOrderData: UpdateOrderData,
    user: any,
  ) {
    try {
      const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
      if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

      const orderDetails = await prisma.orderDetails.findFirst({
        where: {
          orderId: orderId,
        },
      });

      if (!orderDetails) throw new Error('Order does not exist');

      return await this.prismaService.$transaction(async (transaction) => {
        const shopExists = await transaction.shop.findFirst({
          where: {
            isDeleted: false,
            id: updateOrderData.shopId,
          },
        });

        if (!shopExists) throw new Error('Shop does not exist');

        if (updateOrderData?.items) {
          for (const item of updateOrderData?.items) {
            console.log(item);
            await transaction.orderItem.updateMany({
              where: {
                productId: item.productId,
                orderId: orderId,
              },
              data: {
                quantity: item.quantity,
              },
            });
          }
        } else {
          throw new Error('Nothing to update');
        }
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
