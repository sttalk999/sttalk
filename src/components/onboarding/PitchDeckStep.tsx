'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import type { OnboardingData } from '@/app/onboarding/page';
import { uploadPitchDeck, deletePitchDeck } from '@/lib/actions/upload';

interface PitchDeckStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isSaving?: boolean;
  saveError?: string | null;
}

export function PitchDeckStep({ data, updateData, onComplete, onBack, isSaving = false, saveError }: PitchDeckStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or PowerPoint file');
      return;
    }

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('File size must be less than 25MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Supabase Storage via server action
      const result = await uploadPitchDeck(formData);

      if (result.success && result.url) {
        setUploadedFile({
          name: file.name,
          size: formatFileSize(file.size),
        });
        updateData({ pitchDeckUrl: result.url });
      } else {
        setError(result.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = async () => {
    // Delete from storage if we have a URL
    if (data.pitchDeckUrl) {
      try {
        await deletePitchDeck(data.pitchDeckUrl);
      } catch (err) {
        console.error('Error deleting file:', err);
        // Continue anyway - the file might not exist
      }
    }
    setUploadedFile(null);
    updateData({ pitchDeckUrl: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-2">Upload Pitch Deck</h2>
        <p className="text-secondary">
          Share your pitch deck to help investors understand your vision. This step is optional but highly recommended.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? 'border-accent bg-accent/5'
            : uploadedFile
            ? 'border-accent/50 bg-accent/5'
            : 'border-secondary/30 hover:border-secondary/50'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="text-accent animate-spin mb-4" />
            <p className="text-primary-text font-medium">Uploading...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-accent" />
            </div>
            <p className="text-primary-text font-medium mb-1">{uploadedFile.name}</p>
            <p className="text-sm text-secondary mb-4">{uploadedFile.size}</p>
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Uploaded successfully</span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="mt-4 text-sm text-secondary hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <X size={16} />
              Remove file
            </button>
          </div>
        ) : (
          <>
            <Upload size={48} className="mx-auto text-secondary/50 mb-4" />
            <p className="text-primary-text font-medium mb-2">
              Drag and drop your pitch deck here
            </p>
            <p className="text-sm text-secondary mb-4">or</p>
            <label className="inline-block px-6 py-3 bg-accent text-white rounded-full font-bold cursor-pointer hover:bg-accent/90 transition-colors">
              Browse Files
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="mt-4 text-xs text-secondary">
              Supported formats: PDF, PPT, PPTX (max 25MB)
            </p>
          </>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}
      {saveError && (
        <p className="mt-4 text-sm text-red-500 text-center">{saveError}</p>
      )}

      {/* Tips */}
      <div className="mt-8 bg-secondary/5 rounded-xl p-6">
        <h4 className="font-bold text-primary-text mb-3">Tips for a great pitch deck:</h4>
        <ul className="space-y-2 text-sm text-secondary">
          <li>• Keep it concise: 10-15 slides maximum</li>
          <li>• Include: Problem, Solution, Market Size, Business Model, Team, Traction</li>
          <li>• Use visuals over text where possible</li>
          <li>• Highlight your unique value proposition</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="px-6 py-3 text-secondary hover:text-primary-text transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : uploadedFile ? (
            'Complete Setup'
          ) : (
            'Skip & Complete'
          )}
        </button>
      </div>
    </form>
  );
}
