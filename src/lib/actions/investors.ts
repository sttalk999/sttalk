'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { EuropeanInvestor } from '@/lib/supabase';

export async function getUserEntityAndMatches(): Promise<{
  entityId: string | null;
  existingMatchIds: string[];
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { entityId: null, existingMatchIds: [] };
    }

    const supabase = createServerSupabaseClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string } | null };

    if (!profile) {
      return { entityId: null, existingMatchIds: [] };
    }

    // Get user's entity
    const { data: entity } = await supabase
      .from('indian_entities')
      .select('id')
      .eq('profile_id', profile.id)
      .single() as { data: { id: string } | null };

    if (!entity) {
      return { entityId: null, existingMatchIds: [] };
    }

    // Get existing matches
    const { data: matches } = await supabase
      .from('matches')
      .select('investor_id')
      .eq('indian_entity_id', entity.id) as { data: Array<{ investor_id: string }> | null };

    const existingMatchIds = (matches || []).map(m => m.investor_id);

    return { entityId: entity.id, existingMatchIds };
  } catch (error) {
    console.error('Error getting user entity and matches:', error);
    return { entityId: null, existingMatchIds: [] };
  }
}

export async function getInvestors(): Promise<EuropeanInvestor[]> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('european_investors')
      .select('*')
      .limit(100) as { data: EuropeanInvestor[] | null; error: Error | null };

    if (error) {
      console.error('Error fetching investors:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInvestors:', error);
    return [];
  }
}
