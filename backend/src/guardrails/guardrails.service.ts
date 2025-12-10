import { Injectable } from '@nestjs/common';

export interface GuardrailResult {
  triggered: boolean;
  type: 'emergency' | 'medical_advice' | 'phi_request' | null;
  response?: string;
}

@Injectable()
export class GuardrailsService {
  // Emergency keywords that should immediately trigger safety response
  private readonly emergencyKeywords = [
    'chest pain',
    'heart attack',
    "can't breathe",
    'cannot breathe',
    'difficulty breathing',
    'suicidal',
    'suicide',
    'kill myself',
    'want to die',
    'end my life',
    'self harm',
    'self-harm',
    'overdose',
    'severe allergic',
    'anaphylaxis',
    'stroke',
    'unconscious',
    'seizure',
    'severe bleeding',
  ];

  // Medical advice patterns that should trigger refusal
  private readonly medicalAdvicePatterns = [
    /how (?:many|much) (?:mg|ml|milligrams|milliliters|units|iu)/i,
    /what (?:dose|dosage)/i,
    /should i take/i,
    /prescribe/i,
    /what medication/i,
    /recommend.+(?:drug|medication|medicine|dose)/i,
    /\d+\s*(?:mg|ml|mcg|iu)\s+(?:of|for)/i,
    /increase.+(?:dose|dosage)/i,
    /decrease.+(?:dose|dosage)/i,
    /start.+(?:taking|on)\s+\w+\s+(?:mg|ml)/i,
  ];

  // PHI request patterns that Monica should never ask for
  private readonly phiPatterns = [
    /(?:full|complete)\s+name/i,
    /date of birth|dob|birth\s*date/i,
    /social security|ssn/i,
    /(?:home|street|mailing)\s+address/i,
    /medical record/i,
    /insurance.*number/i,
    /driver'?s?\s+license/i,
  ];

  checkMessage(message: string): GuardrailResult {
    // Check for emergency situations first (highest priority)
    const emergencyCheck = this.checkEmergency(message);
    if (emergencyCheck.triggered) {
      return emergencyCheck;
    }

    // Check for medical advice requests
    const medicalAdviceCheck = this.checkMedicalAdvice(message);
    if (medicalAdviceCheck.triggered) {
      return medicalAdviceCheck;
    }

    // No guardrails triggered
    return {
      triggered: false,
      type: null,
    };
  }

  private checkEmergency(message: string): GuardrailResult {
    const lowerMessage = message.toLowerCase();

    for (const keyword of this.emergencyKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          triggered: true,
          type: 'emergency',
          response: this.getEmergencyResponse(),
        };
      }
    }

    return { triggered: false, type: null };
  }

  private checkMedicalAdvice(message: string): GuardrailResult {
    for (const pattern of this.medicalAdvicePatterns) {
      if (pattern.test(message)) {
        return {
          triggered: true,
          type: 'medical_advice',
          response: this.getMedicalAdviceResponse(),
        };
      }
    }

    return { triggered: false, type: null };
  }

  // Validate that Monica's response doesn't ask for PHI
  validateResponse(response: string): boolean {
    for (const pattern of this.phiPatterns) {
      if (pattern.test(response)) {
        return false; // Response contains PHI request - not valid
      }
    }
    return true;
  }

  private getEmergencyResponse(): string {
    return `I need to pause our conversation here. What you're describing sounds like it could be a medical emergency. 

**Please call 911 or go to your nearest emergency room right away.**

Your health and safety are the absolute priority. Once you've received proper medical care, we'd be happy to help you with any follow-up health optimization needs.`;
  }

  private getMedicalAdviceResponse(): string {
    return `I really appreciate you trusting me with that question! However, specific medication dosages and treatment recommendations are something only our clinical team can provide.

Here's why: Everyone's body is unique. What works perfectly for one person might not be right for another. Our clinicians need to review your labs and health history to give you personalized guidance that's safe and effective.

Would you like me to help you book a consultation? Or if you haven't done bloodwork yet, that's usually the best first step so our team has the full picture.`;
  }
}
