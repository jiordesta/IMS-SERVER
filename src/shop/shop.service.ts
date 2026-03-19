import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/libs/db/client';
import { Roles } from 'src/libs/enums';
import { isRoleValid, isUserAuthorized } from 'src/libs/utils/validation';
import { CreateShopData } from './shop.type';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  async fetchAllShops(user: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      const data = await prisma.shop.findMany({
        where: { isDeleted: false },
        include: {
          shopDetails: {
            include: {
              user: {
                include: { userDetails: true },
              },
            },
          },
        },
      });

      return data.map((shop) => ({
        id: shop.id,
        createdAt: shop.createdAt,
        isDeleted: shop.isDeleted,
        userDetails: shop?.shopDetails?.user?.userDetails,
        shopDetails: shop.shopDetails,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createNewShop(createShopData: CreateShopData, user: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      return await this.prismaService.$transaction(async (transaction) => {
        const shop = await transaction.shop.create({});

        await transaction.shopDetails.create({
          data: {
            shopId: shop.id,
            name: createShopData.name,
            userId: createShopData.userId,
          },
        });

        const newlyCreatedShop = await transaction.shop.findUnique({
          where: { id: shop.id },
          include: {
            shopDetails: {
              include: {
                user: {
                  include: { userDetails: true },
                },
              },
            },
          },
        });

        return {
          id: newlyCreatedShop.id,
          createdAt: newlyCreatedShop.createdAt,
          isDeleted: newlyCreatedShop.isDeleted,
          userDetails: newlyCreatedShop?.shopDetails?.user?.userDetails,
          shopDetails: newlyCreatedShop.shopDetails,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Shop Creation Failed');
    }
  }
}
