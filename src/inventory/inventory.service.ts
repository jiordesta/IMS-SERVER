import { BadRequestException, Injectable } from '@nestjs/common';
import { prisma } from 'src/libs/db/client';

@Injectable()
export class InventoryService {
  async fetchAllItems() {
    try {
      const items = await prisma.product.findMany({
        where: {
          isDeleted: false,
          item: {
            some: {
              isDeleted: false,
              quantity: { gt: 0 },
            },
          },
        },
        include: {
          productDetails: true,
          item: true,
        },
      });

      return items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        isDeleted: item.isDeleted,
        productDetails: item.productDetails ?? null,
        stocks: item.item.reduce((total, i) => total + i.quantity, 0) ?? 0,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
