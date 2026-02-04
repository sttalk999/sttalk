'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// =====================================================
// Admin Authentication Check
// =====================================================

export async function verifyAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('clerk_user_id', userId)
    .single();

  return (profile as { role: string } | null)?.role === 'Admin';
}

// =====================================================
// Platform Statistics
// =====================================================

export interface PlatformStats {
  totalProfiles: number;
  totalEntities: number;
  totalInvestors: number;
  totalMatches: number;
  totalMessages: number;
  verifiedEntities: number;
  completedOnboarding: number;
  activeConversations: number;
}

export async function getPlatformStats(): Promise<{
  success: boolean;
  data?: PlatformStats;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    // Run all counts in parallel
    const [
      profilesResult,
      entitiesResult,
      investorsResult,
      matchesResult,
      messagesResult,
      verifiedResult,
      completedResult,
      connectedResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('indian_entities').select('*', { count: 'exact', head: true }),
      supabase.from('european_investors').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('indian_entities').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('indian_entities').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'Connected'),
    ]);

    return {
      success: true,
      data: {
        totalProfiles: profilesResult.count || 0,
        totalEntities: entitiesResult.count || 0,
        totalInvestors: investorsResult.count || 0,
        totalMatches: matchesResult.count || 0,
        totalMessages: messagesResult.count || 0,
        verifiedEntities: verifiedResult.count || 0,
        completedOnboarding: completedResult.count || 0,
        activeConversations: connectedResult.count || 0,
      },
    };
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return { success: false, error: 'Failed to get statistics' };
  }
}

// =====================================================
// Recent Activity
// =====================================================

export interface RecentActivity {
  id: string;
  type: 'signup' | 'onboarding' | 'match' | 'message';
  description: string;
  timestamp: string;
}

export async function getRecentActivity(limit = 20): Promise<{
  success: boolean;
  data?: RecentActivity[];
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    // Get recent profiles (signups)
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('id, display_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5) as { data: Array<{ id: string; display_name: string | null; created_at: string }> | null };

    // Get recent entities (onboarding)
    const { data: recentEntities } = await supabase
      .from('indian_entities')
      .select('id, company_name, created_at, onboarding_completed')
      .order('created_at', { ascending: false })
      .limit(5) as { data: Array<{ id: string; company_name: string; created_at: string; onboarding_completed: boolean }> | null };

    // Get recent matches
    const { data: recentMatches } = await supabase
      .from('matches')
      .select(`
        id,
        status,
        created_at,
        indian_entities (company_name),
        european_investors (firm_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5) as { data: Array<{ id: string; status: string; created_at: string; indian_entities: { company_name: string } | null; european_investors: { firm_name: string } | null }> | null };

    // Get recent messages
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('id, created_at, match_id')
      .order('created_at', { ascending: false })
      .limit(5) as { data: Array<{ id: string; created_at: string; match_id: string }> | null };

    // Combine and sort all activity
    const activity: RecentActivity[] = [];

    for (const profile of recentProfiles || []) {
      activity.push({
        id: `profile-${profile.id}`,
        type: 'signup',
        description: `New user signed up: ${profile.display_name || 'Anonymous'}`,
        timestamp: profile.created_at,
      });
    }

    for (const entity of recentEntities || []) {
      activity.push({
        id: `entity-${entity.id}`,
        type: 'onboarding',
        description: `${entity.company_name} ${entity.onboarding_completed ? 'completed' : 'started'} onboarding`,
        timestamp: entity.created_at,
      });
    }

    for (const match of recentMatches || []) {
      const entityName = match.indian_entities?.company_name || 'Unknown';
      const investorName = match.european_investors?.firm_name || 'Unknown';
      activity.push({
        id: `match-${match.id}`,
        type: 'match',
        description: `New match: ${entityName} ↔ ${investorName} (${match.status})`,
        timestamp: match.created_at,
      });
    }

    for (const message of recentMessages || []) {
      activity.push({
        id: `message-${message.id}`,
        type: 'message',
        description: `New message in conversation`,
        timestamp: message.created_at,
      });
    }

    // Sort by timestamp
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { success: true, data: activity.slice(0, limit) };
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return { success: false, error: 'Failed to get activity' };
  }
}

// =====================================================
// Match Status Distribution
// =====================================================

export async function getMatchStatusDistribution(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: matches } = await supabase
      .from('matches')
      .select('status') as { data: Array<{ status: string }> | null };

    const distribution: Record<string, number> = {
      Pending: 0,
      TeaserRevealed: 0,
      FullReveal: 0,
      Connected: 0,
      Declined: 0,
    };

    for (const match of matches || []) {
      if (match.status in distribution) {
        distribution[match.status]++;
      }
    }

    return { success: true, data: distribution };
  } catch (error) {
    console.error('Error getting match distribution:', error);
    return { success: false, error: 'Failed to get distribution' };
  }
}

// =====================================================
// Industry Distribution
// =====================================================

export async function getIndustryDistribution(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: entities } = await supabase
      .from('indian_entities')
      .select('industry') as { data: Array<{ industry: string | null }> | null };

    const distribution: Record<string, number> = {};

    for (const entity of entities || []) {
      const industry = entity.industry || 'Other';
      distribution[industry] = (distribution[industry] || 0) + 1;
    }

    return { success: true, data: distribution };
  } catch (error) {
    console.error('Error getting industry distribution:', error);
    return { success: false, error: 'Failed to get distribution' };
  }
}

// =====================================================
// Top Investors by Matches
// =====================================================

export async function getTopInvestorsByMatches(limit = 10): Promise<{
  success: boolean;
  data?: Array<{ name: string; matchCount: number }>;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: matches } = await supabase
      .from('matches')
      .select(`
        investor_id,
        european_investors (firm_name)
      `) as { data: Array<{ investor_id: string; european_investors: { firm_name: string } | null }> | null };

    const investorCounts: Record<string, { name: string; count: number }> = {};

    for (const match of matches || []) {
      const investorId = match.investor_id;
      const name = match.european_investors?.firm_name || 'Unknown';

      if (!investorCounts[investorId]) {
        investorCounts[investorId] = { name, count: 0 };
      }
      investorCounts[investorId].count++;
    }

    const sorted = Object.values(investorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(i => ({ name: i.name, matchCount: i.count }));

    return { success: true, data: sorted };
  } catch (error) {
    console.error('Error getting top investors:', error);
    return { success: false, error: 'Failed to get top investors' };
  }
}

// =====================================================
// Entity Management
// =====================================================

export async function getAllEntities(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    companyName: string;
    industry: string | null;
    stage: string | null;
    isVerified: boolean;
    onboardingCompleted: boolean;
    createdAt: string;
    matchCount: number;
  }>;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: entities } = await supabase
      .from('indian_entities')
      .select('*')
      .order('created_at', { ascending: false }) as { data: Array<{
        id: string;
        company_name: string;
        industry: string | null;
        stage: string | null;
        is_verified: boolean;
        onboarding_completed: boolean;
        created_at: string;
      }> | null };

    // Get match counts per entity
    const { data: matches } = await supabase
      .from('matches')
      .select('indian_entity_id') as { data: Array<{ indian_entity_id: string }> | null };

    const matchCounts: Record<string, number> = {};
    for (const match of matches || []) {
      matchCounts[match.indian_entity_id] = (matchCounts[match.indian_entity_id] || 0) + 1;
    }

    const result = (entities || []).map(e => ({
      id: e.id,
      companyName: e.company_name,
      industry: e.industry,
      stage: e.stage,
      isVerified: e.is_verified,
      onboardingCompleted: e.onboarding_completed,
      createdAt: e.created_at,
      matchCount: matchCounts[e.id] || 0,
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting entities:', error);
    return { success: false, error: 'Failed to get entities' };
  }
}

export async function verifyEntity(entityId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    const { error } = await (supabase
      .from('indian_entities') as any)
      .update({ is_verified: true })
      .eq('id', entityId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying entity:', error);
    return { success: false, error: 'Failed to verify entity' };
  }
}
