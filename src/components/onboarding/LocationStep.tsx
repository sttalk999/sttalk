'use client';

import { useState } from 'react';
import { MapPin, Building, FileCheck, ArrowLeft } from 'lucide-react';
import type { OnboardingData } from '@/app/onboarding/page';

interface LocationStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Chandigarh', 'Puducherry',
];

export function LocationStep({ data, updateData, onNext, onBack }: LocationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.city.trim()) newErrors.city = 'City is required';
    if (!data.state) newErrors.state = 'Please select a state';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  // Simple GST validation (15 characters, alphanumeric)
  const validateGST = (gst: string) => {
    if (!gst) return true; // Optional field
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-2">Location Verification</h2>
        <p className="text-secondary">
          Under the 2026 India-EU FTA, we need to verify your Indian business presence.
        </p>
      </div>

      {/* FTA Info Banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-8">
        <p className="text-sm text-primary-text">
          <strong className="text-accent">Why this matters:</strong> The India-EU Free Trade Agreement
          provides preferential access for Indian businesses. Verifying your location helps unlock
          these benefits with European investors.
        </p>
      </div>

      <div className="space-y-6">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <MapPin size={16} className="inline mr-2 text-accent" />
            City *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            placeholder="e.g., Mumbai, Bangalore, Delhi"
            className={`w-full px-4 py-3 bg-background border rounded-xl text-primary-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
              errors.city ? 'border-red-500' : 'border-secondary/20'
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <Building size={16} className="inline mr-2 text-accent" />
            State / Union Territory *
          </label>
          <select
            value={data.state}
            onChange={(e) => updateData({ state: e.target.value })}
            className={`w-full px-4 py-3 bg-background border rounded-xl text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent ${
              errors.state ? 'border-red-500' : 'border-secondary/20'
            }`}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>

        {/* GST Number (optional) */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            <FileCheck size={16} className="inline mr-2 text-accent" />
            GST Number (optional)
          </label>
          <input
            type="text"
            value={data.gstNumber}
            onChange={(e) => updateData({ gstNumber: e.target.value.toUpperCase() })}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
            className={`w-full px-4 py-3 bg-background border rounded-xl text-primary-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent font-mono ${
              data.gstNumber && !validateGST(data.gstNumber) ? 'border-red-500' : 'border-secondary/20'
            }`}
          />
          {data.gstNumber && !validateGST(data.gstNumber) && (
            <p className="mt-1 text-sm text-red-500">Please enter a valid GST number</p>
          )}
          <p className="mt-1 text-xs text-secondary">
            Adding your GST number increases trust with investors and speeds up verification.
          </p>
        </div>

        {/* Country (locked to India) */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            Country
          </label>
          <div className="w-full px-4 py-3 bg-secondary/5 border border-secondary/10 rounded-xl text-secondary">
            India (Required for FTA eligibility)
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-secondary hover:text-primary-text transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
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
