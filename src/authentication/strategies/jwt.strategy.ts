import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from 'src/models/user/schemas/user.schema';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate({ userId }: JwtPayload): Promise<User> {
    const user: User = await this.userModel.findOne({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User with this ID cannot be found .');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive. Contact Technical Support.');
    }
    // if (isJWT(user.activation_token)) {
    //   throw new UnauthorizedException('User email verification is pending.');
    // }
    return user;
  }
}
