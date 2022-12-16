import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

/** Security Packages */
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as xss from 'xss-clean';
import * as hpp from 'hpp';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as compression from 'compression';
import * as logger from 'morgan';

declare const module: any;

const corsOptions = (origin: string, callback) => {
  callback(null, origin || '*');
  // const origins = process.env.ALLOWED_ORIGINS.split(',');
  // if (
  //   process.env.NODE_ENV === 'dev' ||
  //   origins.indexOf('*') !== -1 ||
  //   origins.indexOf(origin) !== -1
  // ) {
  //   callback(null, origin);
  // } else {
  //   callback(new MethodNotAllowedException('Not allowed by CORS'));
  // }
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // bufferLogs: true,
    cors: false,
    abortOnError: false,
  });

  // Initial Express Cfg
  app.use(logger('dev'));
  app.enable('trust proxy');
  app.disable('x-powered-by');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.enableCors({
    credentials: true,
    optionsSuccessStatus: 200,
    origin: corsOptions,
  });
  app.use([
    helmet(),
    xss(),
    hpp(),
    mongoSanitize(),
    compression(),
    cookieParser('TCDB39dv8wkUBqdW6qpC6snA'),
  ]);

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transform: true,
      // Usage of Transformation & ImplicitConversion can consume more Memory.
      /* transformOptions: {
        enableImplicitConversion: true,
      }, */
    }),
  );

  // Configurar títulos de documentación
  const options = new DocumentBuilder()
    .setTitle('Ikusa Media - Backend')
    .setDescription('Landing Rest API for Ikusa Media!')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .addCookieAuth('refreshToken')
    .setContact('Jose Abarca', 'https://www.github.com/AbarcaJ', 'abarcaj.me@gmail.com')
    .build();

  // La ruta en que se sirve la documentación
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  const appPort = process.env.PORT;
  await app.listen(appPort);
  console.log(`Application is running on: ${await app.getUrl()}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
