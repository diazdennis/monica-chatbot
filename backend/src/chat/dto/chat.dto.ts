import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class MessageDto {
  @IsEnum(MessageRole)
  role: MessageRole;

  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @IsString()
  clinicId?: string;
}

export class CtaAction {
  type: 'bloodwork_info' | 'book_consult' | 'emergency' | 'none';
  label?: string;
  url?: string;
}

export class ChatResponseDto {
  message: string;
  sessionId: string;
  cta?: CtaAction;
  guardrailTriggered?: 'emergency' | 'medical_advice' | 'phi_request' | null;
}

export class TranscriptRequestDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}

export class TranscriptResponseDto {
  summary: string;
  transcript: string;
  generatedAt: string;
  sessionId: string;
}
