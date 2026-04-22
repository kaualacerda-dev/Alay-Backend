import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const port = Number(process.env.PORT) || 3001;

    app.enableCors({
      origin: ['http://localhost:4200', 'https://alay-admin.onrender.com', 'http://localhost:3000'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('Failed to bootstrap application', error);
    process.exit(1);
  }
}
bootstrap();
