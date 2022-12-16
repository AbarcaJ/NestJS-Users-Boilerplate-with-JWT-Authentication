import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { CookieOptions } from 'express-serve-static-core';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { isJWT, isEmpty } from 'class-validator';

// Services
import { AuthTokensService } from './auth-tokens.service';

// Schemas & Interfaces & DTOs
import { Role } from 'src/common/enums';
import { User } from '../../models/user/schemas';

import { LoginUserDto, VerifyAccountDto } from '../dto';
import { CreateUserDto } from '../../models/user/dto';

import { JwtRefreshPayload } from '../interfaces';
import { ResendVerificationDto } from '../dto/resend-verification.dto';

@Injectable()
export class AuthService {
  private readonly refreshCookieOpts: CookieOptions;
  private readonly logoutCookieOpts: CookieOptions;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly authTokensService: AuthTokensService,
    private readonly mailService: MailerService,
  ) {
    this.refreshCookieOpts = {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
      signed: true,
      maxAge: configService.getOrThrow<number>('JWT_REFRESH_COOKIE_LIFETIME') * 1000,
    };
    this.logoutCookieOpts = { ...this.refreshCookieOpts, maxAge: undefined };
  }

  public get refreshCookie(): CookieOptions {
    return this.refreshCookieOpts;
  }

  public get logoutCookie(): CookieOptions {
    return this.logoutCookieOpts;
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const activationToken =
        this.authTokensService.getJwtNewRegistrationToken(createUserDto);
      const user = await this.userModel.create({
        ...createUserDto,
        password: await bcrypt.hash(createUserDto.password, 10),
        activation_token: activationToken,
      });
      try {
        this.mailService.sendMail({
          to: user.email,
          subject: 'Example - Verify Account',
          template: 'auth/registrationToken',
          context: { user: user.toJSON(), activationToken },
        });
      } catch (error) {
        await user.deleteOne({});
      }
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async verifyAccount({ token }: VerifyAccountDto) {
    let user: User;
    try {
      const decoded = this.authTokensService.verifyRegistrationToken(token);
      user = await this.userModel.findOneAndUpdate(
        {
          email: decoded.email,
          activation_token: token,
        },
        {
          activation_token: '',
          role: Role.CLIENT,
          isActive: true,
        },
        { new: true, runValidators: true },
      );
    } catch (err) {
      throw new UnauthorizedException('Token invalid or expired.');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found.');
    }

    const tokens = await this.authTokensService.refreshJwtTokens(user);
    this.mailService.sendMail({
      to: user.email,
      subject: 'Example - Welcome',
      template: 'auth/registrationSuccess', // The `.hbs` extension is appended automatically.
      context: { user: user.toJSON() },
    });
    return { ...tokens, user };
  }

  async resendVerification({ email }: ResendVerificationDto) {
    const user = await this.userModel.findOne({ email }).select('+activation_token');
    if (!user) {
      throw new NotFoundException('User with this email cannot be found.');
    } else if (isEmpty(user.activation_token) || !isJWT(user.activation_token)) {
      throw new NotAcceptableException('Your account seems to be already activated.');
    }

    const activationToken = this.authTokensService.getJwtNewRegistrationToken({
      name: user.name,
      email: user.email,
    });

    await user.updateOne({ activation_token: activationToken });
    this.mailService.sendMail({
      to: user.email,
      subject: 'Example - Verify Account',
      template: 'auth/registrationToken', // The `.hbs` extension is appended automatically.
      context: { user: user.toJSON(), activationToken },
    });
  }

  async login({ email, password }: LoginUserDto) {
    const user = await this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid Login / User not found.');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid Login / Password is incorrect.');
    }
    const tokens = await this.authTokensService.refreshJwtTokens(user);
    return { ...tokens, user: { ...user.toJSON(), password: undefined } };
  }

  async getNewAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing `refreshToken` in our Request.');
    }

    const { userId } = this.authTokensService.verify<JwtRefreshPayload>(refreshToken);
    const user = await this.userModel.findOne({
      id: userId,
      refresh_token: refreshToken,
    });
    if (!user) {
      throw new UnauthorizedException('Cannot find an valid user with this token.');
    }
    const tokens = await this.authTokensService.refreshJwtTokens(user);
    return { ...tokens, user };
  }

  async logout(refreshToken: string) {
    if (!refreshToken)
      throw new BadRequestException('Missing `refreshToken` in our Request.');
    const user = await this.userModel.findOneAndUpdate(
      { refresh_token: refreshToken },
      { refresh_token: '' },
      { new: true, runValidators: true },
    );
    if (!user) throw new NotFoundException('No user with this token to invalidate.');
  }

  private handleExceptions(err: any): never {
    if (err.code === 11000) {
      throw new ConflictException(
        `Record exists in the db ${JSON.stringify(err.keyValue)}`,
      );
    }
    console.error(err);
    throw new InternalServerErrorException(
      'Operation failed, Please check server logs for errors.',
    );
  }
}
