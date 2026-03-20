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
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const allowedOrigin = process.env.CLIENT_URL;
    console.log('CLIENT_URL:', allowedOrigin);

    app.enableCors({
      origin: (origin, callback) => {
        console.log('Incoming Origin:', origin);

        // allow requests with no origin (like Thunder Client, Postman)
        if (!origin) return callback(null, true);

        if (origin === allowedOrigin) {
          return callback(null, true);
        }

        console.error(`❌ CORS BLOCKED for origin: ${origin}`);
        return callback(new Error(`Not allowed by CORS: ${origin}`), false);
      },
      credentials: true,
    });

    // 👇 Log all incoming requests (including OPTIONS preflight)
    app.use((req, res, next) => {
      console.log(`[${req.method}] ${req.url}`);
      next();
    });

    await app.listen(process.env.PORT || 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error(`Failed to start application: ${error.message}`);
    setTimeout(bootstrap, 5000);
  }
}

bootstrap();
