import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Roles } from 'src/libs/enums';
import { prisma } from 'src/libs/db/client';
import {
  isRoleIdValid,
  isRoleValid,
  isUserAuthorized,
  isUserIdValid,
} from 'src/libs/utils/validation';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async assignUserRole(roleId: number, userId: number, user: any) {
    try {
      const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
      if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

      if (!(await isRoleIdValid(roleId)))
        throw new BadRequestException('Role ID is Invalid');

      if (!(await isUserIdValid(userId)))
        throw new BadRequestException('User ID is Invalid');

      return await this.prismaService.$transaction(async (transaction) => {
        const userRole = await transaction.userRole.findFirst({
          where: { userId },
        });

        if (userRole) {
          await transaction.userRole.update({
            where: { userId },
            data: { roleId },
          });
        } else {
          await transaction.userRole.create({
            data: { roleId, userId },
          });
        }

        const user = await transaction.user.findFirst({
          where: { isDeleted: false, id: userId },
          include: {
            userDetails: true,
            userCredential: true,
            userRole: {
              include: {
                role: {
                  include: {
                    roleDetails: true,
                  },
                },
              },
            },
          },
        });

        return {
          ...user,
          userDetails: user.userDetails,
          userCredential: user.userCredential,
          userRole: user?.userRole?.role?.roleDetails,
        };
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUserById(userId: number) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId, isDeleted: false },
        include: {
          userDetails: true,
          userCredential: true,
          userRole: {
            include: {
              role: {
                select: {
                  roleDetails: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async fetchAllUsers(user: any) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      const users = await prisma.user.findMany({
        where: { isDeleted: false },
        include: {
          userDetails: true,
          userCredential: true,
          userRole: {
            include: {
              role: {
                include: {
                  roleDetails: true,
                },
              },
            },
          },
        },
      });

      return users.map((user) => ({
        ...user,
        userDetails: user.userDetails,
        userCredential: user.userCredential,
        userRole: user?.userRole?.role?.roleDetails,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getUserRoleByUserId(userId: number) {
    return await prisma.userRole.findFirst({ where: { userId } });
  }

  async getUserCredentialByUserName(username: string) {
    return await prisma.userCredential.findUnique({ where: { username } });
  }

  async deleteUser(user: any, userId: number) {
    const isAuthorized = isUserAuthorized([Roles.SUPER_ADMIN], user);
    if (!isAuthorized) throw new UnauthorizedException('Unauthorized');

    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async fetchUsersNoRole(req: any) {
    const isSuperAdmin = isRoleValid([Roles.SUPER_ADMIN], req);
    if (!isSuperAdmin) throw new UnauthorizedException('Unauthorized');

    try {
      return await prisma.userDetails.findMany({
        where: {
          user: {
            isDeleted: false,
            userRole: null,
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
