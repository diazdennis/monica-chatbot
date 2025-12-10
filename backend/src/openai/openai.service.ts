import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { MessageDto, MessageRole } from '../chat/dto/chat.dto';

@Injectable()
export class OpenaiService implements OnModuleInit {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async chat(systemPrompt: string, messages: MessageDto[]): Promise<string> {
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return (
        response.choices[0]?.message?.content ||
        'I apologize, I had trouble processing that. Could you try again?'
      );
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get response from AI');
    }
  }

  async generateGreeting(systemPrompt: string): Promise<string> {
    const messages: MessageDto[] = [
      {
        role: MessageRole.USER,
        content: 'Hello',
      },
    ];

    return this.chat(systemPrompt, messages);
  }
}
