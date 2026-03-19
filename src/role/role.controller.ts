import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDTO } from './role.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createRole(@Body() createRoleDTO: CreateRoleDTO, @Request() req: any) {
    return await this.roleService.createRole(createRoleDTO, req.user);
  }

  @Get('')
  async getRoles() {
    return await this.roleService.getRoles();
  }
}
