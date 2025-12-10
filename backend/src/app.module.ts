import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { HeygenModule } from './heygen/heygen.module';
import { OpenaiModule } from './openai/openai.module';
import { GuardrailsModule } from './guardrails/guardrails.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Serve the Next.js static export from ../frontend/out
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'out'),
      exclude: ['/api/(.*)'],
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
