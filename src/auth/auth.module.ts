import 'dotenv/config'
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpStr = process.env.JWT_EXPIRATION_TIME;

// Validate env variables
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined!');
}
if (!jwtExpStr) {
  throw new Error('JWT_EXPIRATION_TIME is not defined!');
}

// Convert to number
const jwtExpiration = Number(jwtExpStr);
if (isNaN(jwtExpiration)) {
  throw new Error('JWT_EXPIRATION_TIME must be a number (in seconds)!');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {}
      //signOptions: { expiresIn: jwtExpiration },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UserService
  ],
  controllers: [
    AuthController,
  ]
})
export class AuthModule {}
