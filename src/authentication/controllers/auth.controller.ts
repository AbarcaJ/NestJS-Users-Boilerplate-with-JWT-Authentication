import { Controller, Get, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ApiOperation, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';

// Services
import { AuthService } from '../providers/auth.service';

// Schemas & Interfaces & DTOs
import { User } from '../../models/user/schemas/user.schema';
import { CreateUserDto } from '../../models/user/dto';
import { LoginUserDto, VerificationResendDto, VerifyAccountDto } from '../dto';

// Decorators
import { Cookies } from 'src/common/decorators/cookies.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 200, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request !' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('/verify-account')
  @ApiOperation({ summary: 'Verify user account.' })
  @ApiResponse({ status: 200, description: 'User account activated.' })
  @ApiResponse({ status: 400, description: 'Bad Request !' })
  @ApiResponse({ status: 401, description: 'Invalid verification Token.' })
  async verifyAccount(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: VerifyAccountDto,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.verifyAccount(dto);
    res.cookie('refreshToken', refreshToken, this.authService.refreshCookie);
    return { accessToken, user };
  }

  @Post('/verify-resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(5, 180)
  @ApiOperation({ summary: 'Resend verification tooken' })
  @ApiResponse({ status: 204, description: 'Verification send...' })
  @ApiResponse({ status: 400, description: 'Bad Request !' })
  async verifyAccountResend(@Body() dto: VerificationResendDto) {
    return await this.authService.resendVerification(dto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @Throttle(5, 120)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Access Token and User Info.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Incorrect Login. Invalid Email/Password' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginUserDto: LoginUserDto,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      loginUserDto,
    );
    res.cookie('refreshToken', refreshToken, this.authService.refreshCookie);
    return { accessToken, user };
  }

  @Get('/refreshToken')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Refresh user access Token.' })
  @ApiResponse({ status: 200, description: 'Renew Access Token and Refresh Token!' })
  @ApiResponse({ status: 401, description: 'Missing refreshToken or invalid.' })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Cookies('refreshToken') cookieToken: string,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.getNewAccessToken(
      cookieToken,
    );
    res.cookie('refreshToken', refreshToken, this.authService.refreshCookie);
    return { accessToken, user };
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout User' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'User logout, successfully!' })
  @ApiResponse({ status: 400, description: 'Bad Request, missing `refreshToken`' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Cookies('refreshToken') cookieToken: string,
  ) {
    try {
      await this.authService.logout(cookieToken);
      res.clearCookie('refreshToken', this.authService.logoutCookie);
    } catch (error) {
      res.clearCookie('refreshToken', this.authService.logoutCookie);
      throw error;
    }
  }
}
