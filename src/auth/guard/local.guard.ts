import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info, context) {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
