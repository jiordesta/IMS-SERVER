import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/libs/db/client';
import { OrderStatus, Roles, TransactionStatus } from 'src/libs/enums';
import { isUserAuthorized } from 'src/libs/utils/validation';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchAllTransactions(user: any, filters: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      const transactions = await prisma.transaction.findMany({
        where: { isDeleted: false },
        include: {
          shop: {
            include: {
              shopDetails: true,
            },
          },
          order: {
            include: {
              orderDetails: true,
              orderItem: {
                include: {
                  product: {
                    include: {
                      productDetails: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return transactions.map((transaction) => {
        const orderItems =
          transaction?.order?.flatMap(
            (order) =>
              order?.orderItem?.map((item) => ({
                productName: item?.product?.productDetails?.commonName,
                quantity: item?.quantity,
                type: order?.orderDetails?.type,
              })) ?? [],
          ) ?? [];

        const totalItems = orderItems.reduce(
          (sum, item) => sum + (item.quantity ?? 0),
          0,
        );

        return {
          id: transaction.id,
          status: transaction.status,
          transactionDate: transaction.transactionDate,
          createdAt: transaction.createdAt,
          isDeleted: transaction.isDeleted,
          shopDetails: transaction?.shop?.shopDetails,
          orderItems,
          totalItems,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async setTransactionAsDone(user: any, transactionId: number) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      return await this.prismaService.$transaction(async (transaction) => {
        let dailyTransaction = await transaction.transaction.findFirst({
          where: {
            isDeleted: false,
            id: transactionId,
            status: TransactionStatus.PENDING,
          },
          include: {
            shop: true,
            order: {
              include: {
                orderItem: true,
                orderDetails: true,
              },
            },
          },
        });

        if (!dailyTransaction) throw new Error('Transaction does not exist');

        const orderItems = dailyTransaction?.order?.flatMap(
          (order) =>
            order?.orderItem?.map((item) => ({
              productId: item?.productId,
              quantity: item?.quantity,
              type: order?.orderDetails?.type,
              orderId: order?.id,
            })) ?? [],
        );

        for (const orderItem of orderItems) {
          const actions: any[] = [];

          const product = await transaction.product.findFirst({
            where: {
              id: orderItem.productId,
              item: {
                some: {
                  isDeleted: false,
                  quantity: { gt: 0 },
                },
              },
            },
            include: {
              item: {
                where: {
                  isDeleted: false,
                  quantity: { gt: 0 },
                },
                orderBy: {
                  createdAt: 'asc',
                },
              },
              productDetails: true,
            },
          });

          if (!product) throw new Error('Product does not exist');

          let orderItemQuantity = orderItem.quantity;

          const inventoryItems = product?.item;

          for (const inventoryItem of inventoryItems) {
            const inventoryItemStocks = inventoryItem.quantity;

            if (
              inventoryItemStocks > 0 &&
              inventoryItemStocks >= orderItemQuantity
            ) {
              const newQuantity = inventoryItemStocks - orderItemQuantity;

              actions.push(
                transaction.item.update({
                  where: {
                    id: inventoryItem.id,
                  },
                  data: {
                    quantity: newQuantity,
                  },
                }),
              );

              if (newQuantity === 0) {
                actions.push(
                  transaction.item.update({
                    where: {
                      id: inventoryItem.id,
                    },
                    data: {
                      isDeleted: true,
                    },
                  }),
                );
              }

              orderItemQuantity = 0;

              break;
            } else if (
              inventoryItemStocks > 0 &&
              inventoryItemStocks < orderItemQuantity
            ) {
              orderItemQuantity -= inventoryItemStocks;

              actions.push(
                transaction.item.update({
                  where: {
                    id: inventoryItem.id,
                  },
                  data: {
                    quantity: 0,
                    isDeleted: true,
                  },
                }),
              );
            }
          }

          actions.push(
            transaction.transaction.update({
              where: {
                id: dailyTransaction.id,
              },
              data: {
                status: TransactionStatus.COMPLETED,
              },
            }),
          );

          actions.push(
            transaction.orderDetails.updateMany({
              where: {
                orderId: orderItem.orderId,
              },
              data: {
                status: OrderStatus.COMPLETED,
              },
            }),
          );

          if (orderItemQuantity === 0) {
            await Promise.all(actions);
          } else {
            throw new Error('NEED TO INPUT THE DELIVERY');
          }
        }
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
