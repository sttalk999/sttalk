'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface MessageResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Get all matches for the current user
 */
export async function getUserMatches(): Promise<MessageResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string; role: string } | null };

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    let matches;

    if (profile.role === 'IndianEntity') {
      // Get matches where user is the Indian entity
      const { data: entity } = await supabase
        .from('indian_entities')
        .select('id')
        .eq('profile_id', profile.id)
        .single() as { data: { id: string } | null };

      if (!entity) {
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          investor_id,
          european_investors!inner (
            id,
            firm_name,
            investor_type
          )
        `)
        .eq('indian_entity_id', entity.id)
        .in('status', ['Connected', 'FullReveal', 'TeaserRevealed'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      matches = data;
    } else {
      // Investor viewing their matches
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          indian_entity_id,
          indian_entities!inner (
            id,
            company_name,
            industry
          )
        `)
        .eq('investor_id', profile.id)
        .in('status', ['Connected', 'FullReveal', 'TeaserRevealed'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      matches = data;
    }

    return { success: true, data: matches };
  } catch (error) {
    console.error('Error in getUserMatches:', error);
    return { success: false, error: 'Failed to fetch matches' };
  }
}

/**
 * Get messages for a specific match
 */
export async function getMatchMessages(matchId: string): Promise<MessageResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Verify user has access to this match
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string } | null };

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        is_read,
        created_at
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true }) as { data: Array<{ id: string; content: string; sender_id: string; is_read: boolean; created_at: string }> | null; error: Error | null };

    if (error) throw error;

    // Mark messages as read
    await (supabase
      .from('messages') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .update({ is_read: true })
      .eq('match_id', matchId)
      .neq('sender_id', profile.id);

    return { success: true, data: messages };
  } catch (error) {
    console.error('Error in getMatchMessages:', error);
    return { success: false, error: 'Failed to fetch messages' };
  }
}

/**
 * Send a message in a match
 */
export async function sendMessage(matchId: string, content: string): Promise<MessageResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!content.trim()) {
    return { success: false, error: 'Message cannot be empty' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string } | null };

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Insert the message
    const { data: message, error } = await (supabase
      .from('messages') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .insert({
        match_id: matchId,
        sender_id: profile.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update match updated_at
    await (supabase
      .from('matches') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .update({ updated_at: new Date().toISOString() })
      .eq('id', matchId);

    revalidatePath('/messages');

    return { success: true, data: message };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Get unread message count for the current user
 */
export async function getUnreadCount(): Promise<MessageResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string } | null };

    if (!profile) {
      return { success: true, data: 0 };
    }

    // Count unread messages not sent by the user
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', profile.id) as { count: number | null; error: Error | null };

    if (error) throw error;

    return { success: true, data: count || 0 };
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return { success: false, error: 'Failed to get unread count' };
  }
}
