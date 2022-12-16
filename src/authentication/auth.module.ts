import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Modules & Services & Providers
import { UserModule } from '../models/user/user.module';
import { AuthService } from './providers/auth.service';
import { AuthTokensService, ResetPwdService } from './providers';
import { JWTStrategy } from './strategies';

// Controllers
import { ResetPwdController, AuthController } from './controllers';

// Others
import { User, UserSchema } from '../models/user/schemas';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.getOrThrow<string>('JWT_SECRET_LIFETIME'),
          },
        };
      },
    }),
  ],
  controllers: [AuthController, ResetPwdController],
  providers: [AuthService, AuthTokensService, ResetPwdService, JWTStrategy],
  exports: [AuthService, JWTStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
