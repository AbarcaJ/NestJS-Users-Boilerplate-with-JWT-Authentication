import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

// Controller & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Local Modules
import { CommonModule } from './common/common.module';
import { AuthModule } from './authentication/auth.module';
import { UserModule } from './models/user/user.module';

// Others
import { AppConfiguration } from './config/app.config';
import { JoiSchemaValidation } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfiguration],
      validationSchema: JoiSchemaValidation,
    }),
    // LoggerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => {
    //     return {
    //       pinoHttp: {
    //         level:
    //           config.getOrThrow<string>('enviroment') !== 'production' ? 'debug' : 'info',
    //         useLevelLabels: true,
    //       },
    //     };
    //   },
    // }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      connectionFactory: (connection) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    // Maximo 20 Requests Por Endpoint en 1 Minuto.
    ThrottlerModule.forRoot({ ttl: 60, limit: 40 }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.getOrThrow<string>('mailer_host'),
            port: +configService.getOrThrow<number>('mailer_port'),
            ignoreTLS: configService.getOrThrow<string>('mailer_ignore_tls') === 'true',
            secure: configService.getOrThrow<string>('mailer_secure') === 'true',
            tls: { rejectUnauthorized: false },
            auth: {
              user: configService.getOrThrow<string>('mailer_user'),
              pass: configService.getOrThrow<string>('mailer_pwd'),
            },
          },
          // preview: configService.get<string>('enviroment') === 'dev',
          defaults: {
            from: `"Ikusa Media" <
            ${configService.getOrThrow<string>('mailer_default_from')}
            >`,
          },
          template: {
            dir: __dirname + '/templates/mails',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    MailerModule,
    CommonModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
