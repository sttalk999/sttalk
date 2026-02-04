'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { OnboardingFormData } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Get or create a profile for the current user
 */
export async function getOrCreateProfile(): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string; clerk_user_id: string; role: string } | null };

    if (existingProfile) {
      return { success: true, data: existingProfile };
    }

    // Profile doesn't exist, create one
    const user = await currentUser();

    const { data: newProfile, error: insertError } = await (supabase
      .from('profiles') as any)
      .insert({
        clerk_user_id: userId,
        role: 'IndianEntity',
        display_name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
        email: user?.emailAddresses[0]?.emailAddress || null,
        avatar_url: user?.imageUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return { success: false, error: 'Failed to create profile' };
    }

    return { success: true, data: newProfile };
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Save onboarding data for the current user
 */
export async function saveOnboardingData(formData: OnboardingFormData): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // First, ensure profile exists
    const profileResult = await getOrCreateProfile();
    if (!profileResult.success || !profileResult.data) {
      return { success: false, error: 'Failed to get or create profile' };
    }

    const profile = profileResult.data as { id: string };

    // Check if indian_entity already exists for this profile
    const { data: existingEntity } = await supabase
      .from('indian_entities')
      .select('id')
      .eq('profile_id', profile.id)
      .single() as { data: { id: string } | null };

    const entityData = {
      profile_id: profile.id,
      company_name: formData.companyName,
      industry: formData.industry || null,
      stage: formData.stage || null,
      description: formData.description || null,
      website: formData.website || null,
      city: formData.city || null,
      state: formData.state || null,
      country: 'India',
      gst_number: formData.gstNumber || null,
      compliance_package: formData.compliancePackage,
      pitch_deck_url: formData.pitchDeckUrl,
      onboarding_completed: true,
    };

    if (existingEntity) {
      // Update existing entity
      const { error: updateError } = await (supabase
        .from('indian_entities') as any)
        .update(entityData)
        .eq('id', existingEntity.id);

      if (updateError) {
        console.error('Error updating indian entity:', updateError);
        return { success: false, error: 'Failed to update company information' };
      }
    } else {
      // Create new entity
      const { error: insertError } = await (supabase
        .from('indian_entities') as any)
        .insert(entityData);

      if (insertError) {
        console.error('Error creating indian entity:', insertError);
        return { success: false, error: 'Failed to save company information' };
      }
    }

    // Revalidate dashboard page
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error in saveOnboardingData:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get the current user's entity data
 */
export async function getCurrentEntity(): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single() as { data: { id: string } | null };

    if (!profile) {
      return { success: true, data: null };
    }

    // Get entity
    const { data: entity } = await supabase
      .from('indian_entities')
      .select('*')
      .eq('profile_id', profile.id)
      .single() as { data: unknown | null };

    return { success: true, data: entity };
  } catch (error) {
    console.error('Error in getCurrentEntity:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const result = await getCurrentEntity();
  if (!result.success || !result.data) {
    return false;
  }

  const entity = result.data as { onboarding_completed: boolean };
  return entity.onboarding_completed;
}
