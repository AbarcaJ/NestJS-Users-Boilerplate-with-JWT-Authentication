import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';

// Services
import { AuthService } from '../providers/auth.service';
import { ResetPwdService } from '../providers';

// Schemas & Interfaces & DTOs
import { ChangePasswordDto, ForgotPasswordDto } from '../dto';

@Controller('reset-pwd')
@ApiTags('Auth')
export class ResetPwdController {
  constructor(
    private readonly resetService: ResetPwdService,
    private readonly authService: AuthService,
  ) {}

  @Put()
  @Throttle(5, 120)
  @ApiOperation({ summary: 'Change Password using Token' })
  @ApiResponse({ status: 200, description: 'Password changed successfully!' })
  @ApiResponse({ status: 401, description: 'Invalid token or expired!' })
  async changePassword(
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangePasswordDto,
  ) {
    const { accessToken, refreshToken, user } = await this.resetService.changePassword(
      body,
    );
    res.cookie('refreshToken', refreshToken, this.authService.refreshCookie);
    return { accessToken, user };
  }

  @Post()
  @Throttle(5, 120)
  @ApiOperation({ summary: 'Forgot Password' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Password Forgot Token send to email.' })
  forgotPassword(@Body() body: ForgotPasswordDto, @Query() query: ForgotPasswordDto) {
    return this.resetService.forgotPassword(body.email || query.email);
  }
}
