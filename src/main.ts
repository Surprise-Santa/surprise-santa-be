import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
// import basicAuth from 'express-basic-auth';
import { RequestInterceptor } from './common/interceptors/request.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ErrorsInterceptor } from './common/interceptors/error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get<ConfigService>(ConfigService);
  // const environment = configService.get('environment');
  const appPort = configService.get('PORT');

  // if (environment !== 'development') {
  //   const swaggerUser = configService.get('swagger.user');
  //   app.use(
  //     ['/swagger', '/swagger-json'],
  //     basicAuth({
  //       challenge: true,
  //       users: swaggerUser,
  //     }),
  //   );
  // }

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalInterceptors(
    new RequestInterceptor(),
    new ResponseInterceptor(),
    new ErrorsInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) =>
        new BadRequestException(
          validationErrors.reduce((errorObj, validationList) => ({
            ...errorObj,
            [validationList.property]: validationList,
          })),
        ),
    }),
  );

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Secret Santa')
    .setDescription('Bringing joyful surprises to your holiday season')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swagger = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('swagger', app, swagger);

  await app.listen(appPort || 4000);
}
bootstrap();
