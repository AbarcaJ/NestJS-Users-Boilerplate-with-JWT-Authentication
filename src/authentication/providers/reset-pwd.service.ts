import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcryptjs';

// Services
import { AuthTokensService } from './auth-tokens.service';

// Schemas & Interfaces & DTOs
import { User } from '../../models/user/schemas';
import { ChangePasswordDto } from '../dto';

@Injectable()
export class ResetPwdService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly authTokensService: AuthTokensService,
    private readonly mailService: MailerService,
  ) {}

  async changePassword({ token, password }: ChangePasswordDto) {
    try {
      const decoded = this.authTokensService.verifyPwdResetToken(token);
      const user = await this.userModel.findOneAndUpdate(
        {
          email: decoded.email,
          password_reset_token: token,
        },
        {
          password: await bcrypt.hash(password, 10),
          password_reset_token: '',
        },
        { new: true, runValidators: true },
      );

      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found.');
      }
      const tokens = await this.authTokensService.refreshJwtTokens(user);
      return { ...tokens, user };
    } catch (err) {
      throw new UnauthorizedException('Token invalid or expired.');
    }
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException('Missing `email` in our Request.');

    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User with this email not found.');

    try {
      const pwdResetToken = this.authTokensService.getJwtForPwdReset(user);
      await user.updateOne({ password_reset_token: pwdResetToken });
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Example - Forgot Password',
        template: 'auth/resetPassword', // The `.hbs` extension is appended automatically.
        context: {
          user,
          pwdResetToken,
        },
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Failed... Cannot generate a reset token.');
    }
  }
}
