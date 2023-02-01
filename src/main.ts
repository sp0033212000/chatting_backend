import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

const operationIdFactory = (controllerKey: string, methodKey: string) =>
  `${methodKey}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'https://axios-http.com/'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Chatting APis')
    .setDescription('The chatting API description')
    .setVersion('1.0')
    .addBearerAuth(undefined, 'Authorization')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory,
    extraModels: [],
  });

  SwaggerModule.setup('api', app, document);

  await app.listen(8080, () => {
    console.log(
      `⚡️[server]: Server is running at http://localhost:${8080}\n🌍[environment]: ${
        process.env.NODE_ENV
      }`,
    );
  });
}

bootstrap();
