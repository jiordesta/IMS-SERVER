import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserData } from './auth.type';
import { createHashedPassword } from 'src/libs/utils/encryption';
import { JwtService } from '@nestjs/jwt';
import { isUsernameExist } from 'src/libs/utils/validation';
import { Roles } from 'src/libs/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserData: RegisterUserData) {
    try {
      if (await isUsernameExist(registerUserData.username))
        throw new BadRequestException('Username already in used!');

      const credential = {
        username: registerUserData.username,
        password: await createHashedPassword(registerUserData.password),
      };

      const userDetails = {
        fname: registerUserData.fname,
        lname: registerUserData.lname,
      };

      return await this.prismaService.$transaction(async (transaction) => {
        const userCount = await transaction.user.count();

        const user = await transaction.user.create({});

        if (userCount === 0) {
          //initialize roles
          const roles = [
            'Super Admin',
            'Admin',
            'Shop Owner',
            'Checker',
            'Manager',
          ];

          for (const role of roles) {
            const newlyCreatedRole = await transaction.role.create({});
            await transaction.roleDetails.create({
              data: { roleId: newlyCreatedRole.id, name: role },
            });
          }

          await transaction.userRole.create({
            data: { roleId: Roles.SUPER_ADMIN, userId: user.id },
          });
        }

        await transaction.userCredential.create({
          data: { userId: user.id, ...credential },
        });

        await transaction.userDetails.create({
          data: { ...userDetails, userId: user.id },
        });

        return;
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  async login(req: any) {
    try {
      const user = req.user;
      const payload = { id: user.id };

      return {
        // accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
        // refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }
}
