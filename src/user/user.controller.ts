import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  AssignUserRoleDTO,
  CreateUserRoleDTO,
  UpdateUserDTO,
} from './user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('fetchall')
  @UseGuards(JwtAuthGuard)
  async fetchAllUsers(@Request() req: any) {
    return await this.userService.fetchAllUsers(req.user);
  }

  @Delete('delete/:userId')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Request() req: any,
    @Param('userId', ParseIntPipe) productId: number,
  ) {
    return await this.userService.deleteUser(req.user, productId);
  }

  @Patch('assign/role/:userId')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Request() req: any,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() assignUserRoleDTO: AssignUserRoleDTO,
  ) {
    return await this.userService.assignUserRole(
      assignUserRoleDTO.roleId,
      userId,
      req.user,
    );
  }

  // @Post('/assign/role')
  // @UseGuards(JwtAuthGuard)
  // async assignUserRole(
  //   @Body() createUserRoleDTO: CreateUserRoleDTO,
  //   @Request() req: any,
  // ) {
  //   return await this.userService.assignUserRole(createUserRoleDTO, req.user);
  // }

  // @Get('unnassigned')
  // @UseGuards(JwtAuthGuard)
  // async fetchUsersNoRole(@Request() req: any) {
  //   return await this.userService.fetchUsersNoRole(req.user);
  // }
}
