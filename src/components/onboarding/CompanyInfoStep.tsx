'use client';

import { useState } from 'react';
import { Building2, Globe, Briefcase, FileText } from 'lucide-react';
import type { OnboardingData } from '@/app/onboarding/page';

interface CompanyInfoStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const INDUSTRIES = [
  'Fintech',
  'Clean Energy',
  'Healthcare / Biotech',
  'EdTech',
  'SaaS / Enterprise',
  'E-commerce',
  'AgriTech',
  'Manufacturing',
  'Logistics',
  'Other',
];

const STAGES = [
  'Idea / Patent',
  'Prototype / MVP',
  'Early Revenue',
  'Scaling',
  'Growth',
];

export function CompanyInfoStep({ data, updateData, onNext }: CompanyInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!data.industry) newErrors.industry = 'Please select an industry';
    if (!data.stage) newErrors.stage = 'Please select your current stage';
    if (!data.description.trim()) newErrors.description = 'Please provide a brief description';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-2">Company Information</h2>
        <p className="text-secondary">Tell us about your startup so we can match you with the right investors.</p>
      </div>

      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <Building2 size={16} className="inline mr-2 text-accent" />
            Company Name *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="Your startup name"
            className={`w-full px-4 py-3 bg-background border rounded-xl text-primary-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
              errors.companyName ? 'border-red-500' : 'border-secondary/20'
            }`}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <Briefcase size={16} className="inline mr-2 text-accent" />
            Industry / Sector *
          </label>
          <select
            value={data.industry}
            onChange={(e) => updateData({ industry: e.target.value })}
            className={`w-full px-4 py-3 bg-background border rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
              errors.industry ? 'border-red-500' : 'border-secondary/20'
            }`}
          >
            <option value="">Select your industry</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
          )}
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            Current Stage *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => updateData({ stage })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  data.stage === stage
                    ? 'bg-accent text-white'
                    : 'bg-secondary/5 text-secondary hover:bg-secondary/10'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
          {errors.stage && (
            <p className="mt-1 text-sm text-red-500">{errors.stage}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <FileText size={16} className="inline mr-2 text-accent" />
            Brief Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe what your startup does in 2-3 sentences..."
            rows={4}
            className={`w-full px-4 py-3 bg-background border rounded-xl text-primary-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none ${
              errors.description ? 'border-red-500' : 'border-secondary/20'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Website (optional) */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <Globe size={16} className="inline mr-2 text-accent" />
            Website (optional)
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            placeholder="https://yourcompany.com"
            className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-xl text-primary-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent/90 transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
