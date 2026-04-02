import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/libs/db/client';
import {
  OrderStatus,
  OrderType,
  Roles,
  TransactionStatus,
} from 'src/libs/enums';
import { isUserAuthorized } from 'src/libs/utils/validation';

@Injectable()
export class ReportService {
  async fetchAllReports(user: any, filters: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      const products = await prisma.product.findMany({
        where: { isDeleted: false },
        include: { productDetails: true },
      });

      const transactions = await prisma.transaction.findMany({
        where: {
          status: TransactionStatus.COMPLETED,
          isDeleted: false,
          transactionDate: filters.date,
        },
        include: {
          shop: {
            include: {
              shopDetails: true,
            },
          },
          order: {
            include: {
              orderDetails: true,
              orderItem: true,
            },
          },
        },
      });

      return transactions.map((transaction) => {
        const allOrderItems = transaction.order.flatMap((order) => {
          const status = order.orderDetails?.status;
          const type = order.orderDetails?.type;

          if (status !== OrderStatus.COMPLETED) return [];

          return order.orderItem.map((item) => ({
            ...item,
            status,
            type,
          }));
        });

        const report = products.map((product) => {
          const orderItems = allOrderItems.filter(
            (item) => item.productId === product.id,
          );

          let pahabol = 0;
          let loading = 0;

          for (const orderItem of orderItems) {
            if (orderItem.status === OrderStatus.COMPLETED) {
              if (orderItem.type === OrderType.PAHABOL)
                pahabol += orderItem.quantity;
              if (orderItem.type === OrderType.LOADING)
                loading += orderItem.quantity;
            }
          }

          return {
            productName: product.productDetails?.commonName,
            pahabol,
            loading,
          };
        });

        return {
          shop: transaction.shop.shopDetails,
          report,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
