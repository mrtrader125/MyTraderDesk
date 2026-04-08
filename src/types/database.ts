// src/types/database.ts

export interface Profile {
  id: string; // matches auth.users.id
  email: string | null;
  plan: 'free' | 'pro'; 
  role: 'user' | 'admin';
  full_name: string | null;
  username: string | null;
  telegram_handle: string | null;
  telegram_user_id: number | null; // bigint in DB
  subscription_status?: string | null;
  billing_cycle?: 'monthly' | 'yearly' | 'none' | null;
}

export interface Analysis {
  id: string;
  title: string | null;
  content: string | null;
  asset_symbol: string | null;
  status: string | null;
  image_url: string | null;
  bias: string | null;
  timeframe: string | null;
  category: string | null;
  required_plan: 'free' | 'pro' | null; // 🚨 STRICT TYPED: No more legacy tiers
  created_at: string;
}

export interface TerminalPost {
  id: string;
  ticker: string;
  timeframe: string;
  image_url: string | null;
  thesis: string;
  tier_access: 'free' | 'pro'; // 🚨 CLEANED: Replaced the old 'essential' default
  telegram_message_id: number | null;
  is_broadcasted: boolean;
  created_at: string;
}
