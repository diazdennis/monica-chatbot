import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (dev mode and external access)
  app.enableCors({
    origin: true, // Allow all origins in production (served from same origin)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // API prefix - all backend routes under /api
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Monica running on http://localhost:${port}`);
  console.log(`   Frontend: http://localhost:${port}`);
  console.log(`   API: http://localhost:${port}/api`);
}
bootstrap();
