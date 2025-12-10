import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface HeyGenSession {
  sessionId: string;
  accessToken: string;
  url: string;
}

export interface StreamingAvatarConfig {
  avatarId: string;
  voiceId?: string;
  quality?: 'low' | 'medium' | 'high';
}

@Injectable()
export class HeygenService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.heygen.com';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('HEYGEN_API_KEY') || '';
  }

  /**
   * Create a new streaming avatar session
   * This returns an access token that the frontend uses to connect
   */
  async createStreamingSession(
    config?: StreamingAvatarConfig,
  ): Promise<HeyGenSession> {
    try {
      // Create streaming avatar session
      const response = await axios.post(
        `${this.baseUrl}/v1/streaming.new`,
        {
          quality: config?.quality || 'medium',
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data.data;

      return {
        sessionId: data.session_id,
        accessToken: data.access_token,
        url: data.url,
      };
    } catch (error: any) {
      console.error('HeyGen API error:', error.response?.data || error.message);
      throw new Error('Failed to create HeyGen streaming session');
    }
  }

  /**
   * Get available avatars from HeyGen
   */
  async getAvatars(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/avatars`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      return response.data.data?.avatars || [];
    } catch (error: any) {
      console.error(
        'Failed to fetch avatars:',
        error.response?.data || error.message,
      );
      return [];
    }
  }

  /**
   * Get available voices from HeyGen
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/voices`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      return response.data.data?.voices || [];
    } catch (error: any) {
      console.error(
        'Failed to fetch voices:',
        error.response?.data || error.message,
      );
      return [];
    }
  }

  /**
   * Close a streaming session
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/v1/streaming.stop`,
        { session_id: sessionId },
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error: any) {
      console.error(
        'Failed to close session:',
        error.response?.data || error.message,
      );
    }
  }

  /**
   * Generate an access token for frontend SDK
   */
  async generateAccessToken(): Promise<{ token: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/streaming.create_token`,
        {},
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        token: response.data.data?.token || response.data.token,
      };
    } catch (error: any) {
      console.error(
        'Failed to generate token:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate HeyGen access token');
    }
  }
}
