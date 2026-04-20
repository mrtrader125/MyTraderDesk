// src/ai/types/index.ts

export type ExecutionStyle = 'Scalper' | 'Intraday' | 'Swing';
export type LoggingPreference = 'Minimalist' | 'High-Data Logger';

export interface UserProfile {
  assetFocus: string; // e.g., "Single-Asset (Gold)", "Broad Market (15-20 pairs)"
  executionStyle: ExecutionStyle;
  loggingPreference: LoggingPreference;
  timezone?: string;  // Essential for triggering the correct cron jobs later
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// We will use this later when we build the Cron Job API route
export interface RoutineTriggerPayload {
  userId: string;
  userProfile: UserProfile;
  triggerType: 'SUNDAY_PREP' | 'DAILY_OPEN' | 'SESSION_WRAP' | 'WEEKEND_REVIEW';
}