import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleData } from './role.type';
import { Roles } from 'src/libs/enums';
import { isRoleNameExist, isRoleValid } from 'src/libs/utils/validation';
import { prisma } from 'src/libs/db/client';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRole(createRoleData: CreateRoleData, user: any) {
    try {
      const isSuperAdmin = isRoleValid([Roles.SUPER_ADMIN], user);
      if (!isSuperAdmin) throw new UnauthorizedException('Unauthorized');

      if (await isRoleNameExist(createRoleData.name))
        throw new BadRequestException('Role name Already exist');

      return await this.prismaService.$transaction(async (transaction) => {
        const role = await transaction.role.create({});
        await transaction.roleDetails.create({
          data: { roleId: role.id, name: createRoleData.name },
        });
        return;
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Role Creation failed');
    }
  }

  async getRoles() {
    try {
      return await prisma.role.findMany({ include: { roleDetails: true } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
