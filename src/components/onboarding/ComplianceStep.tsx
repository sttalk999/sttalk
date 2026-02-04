'use client';

import { ArrowLeft, Check, Shield, Zap, Crown } from 'lucide-react';
import type { OnboardingData } from '@/app/onboarding/page';

interface ComplianceStepProps {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PACKAGES = [
  {
    id: 'None' as const,
    name: 'Free Tier',
    price: '₹0',
    period: 'forever',
    icon: Shield,
    description: 'Basic access to explore the platform',
    features: [
      'Browse investor directory',
      'View blurred investor details',
      'Basic profile visibility',
    ],
    limitations: [
      'Cannot send intro requests',
      'Limited to 5 investor views/month',
    ],
  },
  {
    id: 'PackageA' as const,
    name: 'Growth',
    price: '₹9,999',
    period: '/month',
    icon: Zap,
    description: 'For startups ready to connect',
    popular: true,
    features: [
      'Full investor thesis access',
      'Unlimited intro requests',
      'Priority in investor feeds',
      'AI-powered matching',
      'Basic analytics dashboard',
    ],
    limitations: [],
  },
  {
    id: 'PackageB' as const,
    name: 'Enterprise',
    price: '₹24,999',
    period: '/month',
    icon: Crown,
    description: 'For serious fundraising rounds',
    features: [
      'Everything in Growth, plus:',
      'Dedicated account manager',
      'Featured placement in directory',
      'Investor meeting scheduling',
      'Due diligence support',
      'FTA compliance assistance',
    ],
    limitations: [],
  },
];

export function ComplianceStep({ data, updateData, onNext, onBack }: ComplianceStepProps) {
  const handleSelect = (packageId: 'PackageA' | 'PackageB' | 'None') => {
    updateData({ compliancePackage: packageId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-2">Choose Your Plan</h2>
        <p className="text-secondary">
          Select a compliance package to unlock FTA benefits and connect with European investors.
        </p>
      </div>

      {/* Package Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          const isSelected = data.compliancePackage === pkg.id;

          return (
            <div
              key={pkg.id}
              onClick={() => handleSelect(pkg.id)}
              className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-secondary/20 hover:border-secondary/40'
              } ${pkg.popular ? 'ring-2 ring-accent ring-offset-2' : ''}`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              <div
                className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'bg-accent border-accent' : 'border-secondary/30'
                }`}
              >
                {isSelected && <Check size={14} className="text-white" />}
              </div>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isSelected ? 'bg-accent/20' : 'bg-secondary/10'
                }`}
              >
                <Icon size={24} className={isSelected ? 'text-accent' : 'text-secondary'} />
              </div>

              {/* Title & Price */}
              <h3 className="text-lg font-bold text-primary-text">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-black text-primary-text">{pkg.price}</span>
                <span className="text-sm text-secondary">{pkg.period}</span>
              </div>
              <p className="text-sm text-secondary mb-4">{pkg.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-primary-text">{feature}</span>
                  </li>
                ))}
                {pkg.limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary/50 shrink-0">✕</span>
                    <span className="text-secondary">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* FTA Note */}
      <div className="bg-secondary/5 rounded-xl p-4 mb-8">
        <p className="text-sm text-secondary">
          <strong>Note:</strong> All paid packages include FTA compliance documentation and
          verification services. You can upgrade or downgrade at any time.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
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
