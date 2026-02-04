'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a pitch deck file to Supabase Storage
 */
export async function uploadPitchDeck(formData: FormData): Promise<UploadResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const file = formData.get('file') as File | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload a PDF or PowerPoint file.' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large. Maximum size is 25MB.' };
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}-${sanitizedName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('pitch-decks')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: 'Failed to upload file. Please try again.' };
    }

    // For private buckets, we store the path and generate signed URLs when needed
    // The path can be used to generate signed URLs later for investor access
    const storagePath = `pitch-decks/${data.path}`;

    return {
      success: true,
      url: storagePath,
    };
  } catch (error) {
    console.error('Error in uploadPitchDeck:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a pitch deck file from Supabase Storage
 */
export async function deletePitchDeck(filePath: string): Promise<UploadResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Verify the file belongs to the user
    if (!filePath.includes(userId)) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createServerSupabaseClient();

    // Extract the path within the bucket
    const pathInBucket = filePath.replace('pitch-decks/', '');

    const { error } = await supabase.storage
      .from('pitch-decks')
      .remove([pathInBucket]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error: 'Failed to delete file' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deletePitchDeck:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a signed URL for accessing a pitch deck
 */
export async function getPitchDeckSignedUrl(filePath: string): Promise<UploadResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Extract the path within the bucket
    const pathInBucket = filePath.replace('pitch-decks/', '');

    const { data, error } = await supabase.storage
      .from('pitch-decks')
      .createSignedUrl(pathInBucket, 3600); // 1 hour expiry

    if (error) {
      console.error('Signed URL error:', error);
      return { success: false, error: 'Failed to generate access URL' };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error('Error in getPitchDeckSignedUrl:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
