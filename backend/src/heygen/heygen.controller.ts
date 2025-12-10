import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { HeygenService } from './heygen.service';
import type { StreamingAvatarConfig } from './heygen.service';

@Controller('heygen')
export class HeygenController {
  constructor(private readonly heygenService: HeygenService) {}

  /**
   * Get an access token for the HeyGen Streaming Avatar SDK
   */
  @Post('token')
  async getToken() {
    return this.heygenService.generateAccessToken();
  }

  /**
   * Create a new streaming session
   */
  @Post('session')
  async createSession(@Body() config?: StreamingAvatarConfig) {
    return this.heygenService.createStreamingSession(config);
  }

  /**
   * Close an existing session
   */
  @Delete('session/:sessionId')
  async closeSession(@Param('sessionId') sessionId: string) {
    await this.heygenService.closeSession(sessionId);
    return { success: true };
  }

  /**
   * Get available avatars
   */
  @Get('avatars')
  async getAvatars() {
    const avatars = await this.heygenService.getAvatars();
    return { avatars };
  }

  /**
   * Get available voices
   */
  @Get('voices')
  async getVoices() {
    const voices = await this.heygenService.getVoices();
    return { voices };
  }
}
