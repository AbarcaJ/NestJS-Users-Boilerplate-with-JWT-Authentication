import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

// Schemas & Interfaces & DTOs
import { User } from '../../models/user/schemas/user.schema';
import {
  JwtPayload,
  JwtRefreshPayload,
  PwdResetPayload,
  RegistrationTokenPayload,
} from '../interfaces';

@Injectable()
export class AuthTokensService {
  private readonly JWT_SECRET_LIFETIME: string;
  private readonly JWT_REFRESH_LIFETIME: string;
  private readonly JWT_PWD_RESET_SECRET: string;
  private readonly JWT_PWD_RESET_LIFETIME: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET_LIFETIME = configService.getOrThrow<string>('JWT_SECRET_LIFETIME');
    this.JWT_REFRESH_LIFETIME = configService.getOrThrow<string>('JWT_REFRESH_LIFETIME');
    this.JWT_PWD_RESET_SECRET = configService.getOrThrow<string>('pwd_reset_secret');
    this.JWT_PWD_RESET_LIFETIME = configService.getOrThrow<string>('pwd_reset_exp');
  }

  public get JwtPwdSecret(): string {
    return this.JWT_PWD_RESET_SECRET;
  }

  public get JwtPwdLifetime(): string {
    return this.JWT_PWD_RESET_LIFETIME;
  }

  verify<T extends object>(token: string, opts?: JwtSignOptions) {
    return this.jwtService.verify<T>(token, opts);
  }

  async verifyAsync<T extends object>(token: string, opts?: JwtSignOptions) {
    return this.jwtService.verifyAsync<T>(token, opts);
  }

  signJwt(data: string | object | Buffer, opts?: JwtSignOptions) {
    return this.jwtService.sign(data, opts);
  }

  async signJwtAsync(data: string | object | Buffer, opts?: JwtSignOptions) {
    return this.jwtService.signAsync(data, opts);
  }

  async refreshJwtTokens(user: User) {
    const tokens = this.getJwtTokens(user);
    await user.updateOne({ refresh_token: tokens.refreshToken });
    return tokens;
  }

  getJwtTokens(user: User) {
    const accessToken = this.getJwtAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = this.getJwtRefreshToken({ userId: user.id, email: user.email });
    return { accessToken, refreshToken };
  }

  getJwtAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, { expiresIn: this.JWT_SECRET_LIFETIME });
  }

  getJwtRefreshToken(payload: JwtRefreshPayload) {
    return this.jwtService.sign(payload, { expiresIn: this.JWT_REFRESH_LIFETIME });
  }

  verifyPwdResetToken(token: string): PwdResetPayload {
    return this.jwtService.verify<PwdResetPayload>(token, {
      ignoreExpiration: false,
      secret: this.JWT_PWD_RESET_SECRET,
    });
  }

  getJwtForPwdReset(user: User) {
    return this.jwtService.sign(
      { email: user.email },
      { secret: this.JWT_PWD_RESET_SECRET, expiresIn: this.JWT_PWD_RESET_LIFETIME },
    );
  }

  verifyRegistrationToken(token: string): RegistrationTokenPayload {
    return this.jwtService.verify<RegistrationTokenPayload>(token, {
      ignoreExpiration: false,
      secret: `${this.JWT_PWD_RESET_SECRET}-act`,
    });
  }

  getJwtNewRegistrationToken({ name, email }: RegistrationTokenPayload) {
    return this.jwtService.sign(
      { name, email: email.toLowerCase() },
      { secret: `${this.JWT_PWD_RESET_SECRET}-act`, expiresIn: '1w' },
    );
  }
}
