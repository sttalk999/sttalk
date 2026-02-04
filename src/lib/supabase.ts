import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Client-side Supabase client (singleton)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// =====================================================
// Database Type Definitions
// =====================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      indian_entities: {
        Row: IndianEntity;
        Insert: Omit<IndianEntity, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IndianEntity, 'id'>>;
      };
      european_investors: {
        Row: EuropeanInvestor;
        Insert: Omit<EuropeanInvestor, 'id'>;
        Update: Partial<Omit<EuropeanInvestor, 'id'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Match, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
    };
  };
}

// =====================================================
// Table Types
// =====================================================

export interface Profile {
  id: string;
  clerk_user_id: string;
  role: 'IndianEntity' | 'EuropeanInvestor' | 'Admin';
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface IndianEntity {
  id: string;
  profile_id: string;
  company_name: string;
  industry: string | null;
  stage: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  country: string;
  gst_number: string | null;
  compliance_package: 'PackageA' | 'PackageB' | 'None';
  pitch_deck_url: string | null;
  is_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface EuropeanInvestor {
  id: string;
  firm_name: string;
  website: string;
  hq_location: string;
  investment_focus: string;
  stages: string;
  investment_thesis: string;
  investor_type: string;
  min_check_size: number | null;
  max_check_size: number | null;
}

export interface Match {
  id: string;
  indian_entity_id: string;
  investor_id: string;
  status: 'Pending' | 'TeaserRevealed' | 'FullReveal' | 'Connected' | 'Declined';
  initiated_by: 'entity' | 'investor' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// =====================================================
// Helper Types for Forms
// =====================================================

export interface OnboardingFormData {
  companyName: string;
  industry: string;
  stage: string;
  description: string;
  website: string;
  city: string;
  state: string;
  gstNumber: string;
  compliancePackage: 'PackageA' | 'PackageB' | 'None';
  pitchDeckUrl: string | null;
}
