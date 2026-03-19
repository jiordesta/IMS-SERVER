import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './auth.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { JwtAuthGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerUserDTO: RegisterUserDTO) {
    return await this.authService.register(registerUserDTO);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async loginUser(@Request() request: any) {
    return await this.authService.login(request);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const { user } = req;

    return user;
  }
}
