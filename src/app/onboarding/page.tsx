'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { CompanyInfoStep } from '@/components/onboarding/CompanyInfoStep';
import { LocationStep } from '@/components/onboarding/LocationStep';
import { ComplianceStep } from '@/components/onboarding/ComplianceStep';
import { PitchDeckStep } from '@/components/onboarding/PitchDeckStep';
import { Check } from 'lucide-react';
import { saveOnboardingData } from '@/lib/actions/onboarding';

export interface OnboardingData {
  companyName: string;
  industry: string;
  stage: string;
  description: string;
  website: string;
  city: string;
  state: string;
  country: string;
  gstNumber: string;
  compliancePackage: 'PackageA' | 'PackageB' | 'None';
  pitchDeckUrl: string | null;
}

const STEPS = [
  { id: 1, name: 'Company Info', description: 'Tell us about your startup' },
  { id: 2, name: 'Location', description: 'Verify your Indian presence' },
  { id: 3, name: 'Compliance', description: 'Choose your FTA package' },
  { id: 4, name: 'Pitch Deck', description: 'Upload your materials' },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    stage: '',
    description: '',
    website: '',
    city: '',
    state: '',
    country: 'India',
    gstNumber: '',
    compliancePackage: 'None',
    pitchDeckUrl: null,
  });

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveOnboardingData({
        companyName: data.companyName,
        industry: data.industry,
        stage: data.stage,
        description: data.description,
        website: data.website,
        city: data.city,
        state: data.state,
        gstNumber: data.gstNumber,
        compliancePackage: data.compliancePackage,
        pitchDeckUrl: data.pitchDeckUrl,
      });

      if (result.success) {
        router.push('/dashboard');
      } else {
        setSaveError(result.error || 'Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      setSaveError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="sticky" />

      <main className="max-w-4xl mx-auto px-8 py-12">
        {/* Progress Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-primary-text mb-2">
            Welcome, {user?.firstName || 'Founder'}!
          </h1>
          <p className="text-secondary">
            Let&apos;s set up your Indian entity profile to connect with European investors.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep > step.id
                        ? 'bg-accent text-white'
                        : currentStep === step.id
                        ? 'bg-accent text-white ring-4 ring-accent/20'
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={18} /> : step.id}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block ${
                      currentStep >= step.id ? 'text-primary-text' : 'text-secondary'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-accent' : 'bg-secondary/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-surface rounded-2xl border border-secondary/10 p-8">
          {currentStep === 1 && (
            <CompanyInfoStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <LocationStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <ComplianceStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <PitchDeckStep
              data={data}
              updateData={updateData}
              onComplete={handleComplete}
              onBack={prevStep}
              isSaving={isSaving}
              saveError={saveError}
            />
          )}
        </div>
      </main>
    </div>
  );
}
