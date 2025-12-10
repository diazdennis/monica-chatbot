import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenaiModule } from '../openai/openai.module';
import { GuardrailsModule } from '../guardrails/guardrails.module';

@Module({
  imports: [OpenaiModule, GuardrailsModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
