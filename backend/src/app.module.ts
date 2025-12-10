import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { HeygenModule } from './heygen/heygen.module';
import { OpenaiModule } from './openai/openai.module';
import { GuardrailsModule } from './guardrails/guardrails.module';

// Determine the frontend static files path
// Priority: STATIC_PATH env var > relative to cwd > relative to __dirname
function getStaticPath(): string {
  if (process.env.STATIC_PATH) {
    return process.env.STATIC_PATH;
  }

  // Try relative to current working directory (for Render/production)
  const cwdPath = join(process.cwd(), '..', 'frontend', 'out');
  if (existsSync(cwdPath)) {
    console.log(`Static files path (cwd): ${cwdPath}`);
    return cwdPath;
  }

  // Try relative to __dirname (for local development)
  const dirPath = join(__dirname, '..', '..', 'frontend', 'out');
  if (existsSync(dirPath)) {
    console.log(`Static files path (__dirname): ${dirPath}`);
    return dirPath;
  }

  // Fallback for Docker (files copied to /app/frontend/out)
  const dockerPath = join(process.cwd(), 'frontend', 'out');
  console.log(`Static files path (docker fallback): ${dockerPath}`);
  return dockerPath;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Serve the Next.js static export
    ServeStaticModule.forRoot({
      rootPath: getStaticPath(),
      exclude: ['/api{/*path}'],
    }),
    ChatModule,
    HeygenModule,
    OpenaiModule,
    GuardrailsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
