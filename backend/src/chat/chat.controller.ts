import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  ChatRequestDto,
  ChatResponseDto,
  TranscriptRequestDto,
  TranscriptResponseDto,
} from './dto/chat.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() request: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.processChat(request);
  }

  @Get('greeting')
  async getGreeting(
    @Query('sessionId') sessionId?: string,
  ): Promise<ChatResponseDto> {
    const session = sessionId || uuidv4();
    return this.chatService.getGreeting(session);
  }

  @Post('transcript')
  async generateTranscript(
    @Body() request: TranscriptRequestDto,
  ): Promise<TranscriptResponseDto> {
    return this.chatService.generateTranscript(request);
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'monica-chat' };
  }
}
