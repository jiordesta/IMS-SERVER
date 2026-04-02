import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('Unauthorized access');
    }
    return user;
  }
}
