import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { validatePassword } from '../../libs/utils/encryption';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string) {
    const userCredential =
      await this.userService.getUserCredentialByUserName(username);

    if (!userCredential)
      throw new BadRequestException('Username Not Associated to any Account');

    if (!(await validatePassword(password, userCredential.password)))
      throw new BadRequestException('Password Not Matched');

    const user = await this.userService.getUserById(userCredential.userId);

    if (!user) throw new BadRequestException('User Not Found');

    return user;
  }
}
