import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true, // throws error for unknown props
        transform: true, // auto-transform payloads into DTO classes
      }),
    );

    const allowedOrigins = [
      'http://localhost:5173',
      'https://ims-client-xi.vercel.app',
    ];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    await app.listen(process.env.PORT || 3000);

    //console.log(`Allowed origins: ${process.env.CLIENT_URL}`);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error(`Failed to start application: ${error.message}`);
    setTimeout(bootstrap, 5000);
  }
}

bootstrap();
