import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenaiService } from '../openai/openai.service';
import { GuardrailsService } from '../guardrails/guardrails.service';
import {
  ChatRequestDto,
  ChatResponseDto,
  CtaAction,
  TranscriptRequestDto,
  TranscriptResponseDto,
  MessageDto,
  MessageRole,
} from './dto/chat.dto';
import { getMonicaSystemPrompt } from '../prompts/monica.prompt';
import clinicConfig, { ClinicConfig } from '../config/clinic.config';

@Injectable()
export class ChatService {
  private clinic: ClinicConfig;

  constructor(
    private openaiService: OpenaiService,
    private guardrailsService: GuardrailsService,
    private configService: ConfigService,
  ) {
    // Load clinic config
    this.clinic = clinicConfig();
  }

  async processChat(request: ChatRequestDto): Promise<ChatResponseDto> {
    const lastMessage = request.messages[request.messages.length - 1];

    // Check guardrails on user's message
    const guardrailResult = this.guardrailsService.checkMessage(
      lastMessage.content,
    );

    if (guardrailResult.triggered) {
      return {
        message: guardrailResult.response!,
        sessionId: request.sessionId,
        guardrailTriggered: guardrailResult.type,
        cta:
          guardrailResult.type === 'emergency'
            ? { type: 'emergency', label: 'Call 911' }
            : { type: 'book_consult', label: 'Book a Consultation' },
      };
    }

    // Get AI response
    const systemPrompt = getMonicaSystemPrompt(this.clinic);
    const aiResponse = await this.openaiService.chat(
      systemPrompt,
      request.messages,
    );

    // Validate AI response doesn't request PHI
    if (!this.guardrailsService.validateResponse(aiResponse)) {
      console.warn('AI response contained PHI request, regenerating...');
      // Could implement retry logic here
    }

    // Determine appropriate CTA based on response content
    const cta = this.determineCta(aiResponse);

    return {
      message: aiResponse,
      sessionId: request.sessionId,
      cta,
      guardrailTriggered: null,
    };
  }

  async getGreeting(sessionId: string): Promise<ChatResponseDto> {
    const systemPrompt = getMonicaSystemPrompt(this.clinic);
    const greeting = await this.openaiService.generateGreeting(systemPrompt);

    return {
      message: greeting,
      sessionId,
      cta: { type: 'none' },
      guardrailTriggered: null,
    };
  }

  private determineCta(response: string): CtaAction {
    const lowerResponse = response.toLowerCase();

    // Check for bloodwork/lab mentions
    if (
      lowerResponse.includes('bloodwork') ||
      lowerResponse.includes('lab') ||
      lowerResponse.includes('panel') ||
      lowerResponse.includes('testing')
    ) {
      return {
        type: 'bloodwork_info',
        label: 'Learn About Bloodwork',
      };
    }

    // Check for consultation mentions
    if (
      lowerResponse.includes('consult') ||
      lowerResponse.includes('book') ||
      lowerResponse.includes('schedule') ||
      lowerResponse.includes('appointment')
    ) {
      return {
        type: 'book_consult',
        label: 'Book a Consultation',
      };
    }

    return { type: 'none' };
  }

  async generateTranscript(
    request: TranscriptRequestDto,
  ): Promise<TranscriptResponseDto> {
    // Format the transcript text
    const transcript = this.formatTranscript(request.messages);

    // Generate AI summary
    const summary = await this.generateSummary(request.messages);

    return {
      summary,
      transcript,
      generatedAt: new Date().toISOString(),
      sessionId: request.sessionId,
    };
  }

  private formatTranscript(messages: MessageDto[]): string {
    const lines: string[] = [];
    const timestamp = new Date().toLocaleString();

    lines.push('═══════════════════════════════════════════════════════');
    lines.push(`  CONVERSATION TRANSCRIPT - ${this.clinic.name}`);
    lines.push('═══════════════════════════════════════════════════════');
    lines.push(`Generated: ${timestamp}`);
    lines.push('───────────────────────────────────────────────────────');
    lines.push('');

    messages.forEach((msg, index) => {
      const speaker = msg.role === 'assistant' ? 'Monica (AI Assistant)' : 'You';
      lines.push(`[${speaker}]`);
      lines.push(msg.content);
      if (index < messages.length - 1) {
        lines.push('');
      }
    });

    lines.push('');
    lines.push('───────────────────────────────────────────────────────');
    lines.push('');

    return lines.join('\n');
  }

  private async generateSummary(messages: MessageDto[]): Promise<string> {
    if (messages.length < 2) {
      return 'Conversation too short to summarize.';
    }

    const conversationText = messages
      .map((m) => `${m.role === 'assistant' ? 'Monica' : 'User'}: ${m.content}`)
      .join('\n');

    const summaryPrompt = `Please provide a brief, helpful summary of this health consultation conversation. 
Focus on:
- Main topics discussed
- Key questions asked
- Important information shared
- Any recommended next steps

Keep the summary concise (3-5 sentences) and user-friendly.

Conversation:
${conversationText}`;

    try {
      const summary = await this.openaiService.chat(
        'You are a helpful assistant that summarizes health consultation conversations. Be concise and focus on actionable information.',
        [{ role: MessageRole.USER, content: summaryPrompt }],
      );
      return summary;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return 'Summary unavailable. Please review the transcript above.';
    }
  }
}
