import { registerAs } from '@nestjs/config';

export interface ClinicConfig {
  id: string;
  name: string;
  tagline: string;
  services: string[];
  ctaButtons: {
    primary: { label: string; action: string };
    secondary: { label: string; action: string };
  };
  competitorMention: {
    name: string;
    company: string;
  };
}

export default registerAs(
  'clinic',
  (): ClinicConfig => ({
    id: process.env.CLINIC_ID || 'primal-health',
    name: process.env.CLINIC_NAME || 'Primal Health',
    tagline: "Your partner in men's health optimization",
    services: [
      'Comprehensive bloodwork and lab testing',
      'Hormone optimization',
      'Weight management programs',
      'Wellness consultations',
    ],
    ctaButtons: {
      primary: {
        label: 'Learn About Bloodwork',
        action: 'show_bloodwork_info',
      },
      secondary: {
        label: 'Book a Consult',
        action: 'book_consult',
      },
    },
    competitorMention: {
      name: 'Allen',
      company: 'Ways2Well',
    },
  }),
);
