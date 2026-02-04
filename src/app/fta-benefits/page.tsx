import { Header } from '@/components/ui/Header';
import { Shield, Globe, FileCheck, Banknote, Scale, Handshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FTABenefitsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="sticky" />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold mb-6">
            <Globe size={16} />
            2026 India-EU Free Trade Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-primary-text mb-6">
            FTA <span className="text-accent">Benefits</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Unlock unprecedented opportunities for cross-border investment and trade between India and the European Union.
          </p>
        </section>

        {/* Key Benefits */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Banknote size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Reduced Tariffs</h3>
            <p className="text-sm text-secondary">
              Significantly reduced import/export duties on goods and services between India and EU member states.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Shield size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Investment Protection</h3>
            <p className="text-sm text-secondary">
              Enhanced legal frameworks protecting cross-border investments with clear dispute resolution mechanisms.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <FileCheck size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Simplified Compliance</h3>
            <p className="text-sm text-secondary">
              Streamlined regulatory requirements and mutual recognition of standards reduce bureaucratic overhead.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Scale size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Tax Incentives</h3>
            <p className="text-sm text-secondary">
              Special tax treatments for qualifying cross-border investments and technology transfers.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Globe size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Market Access</h3>
            <p className="text-sm text-secondary">
              Easier entry into EU markets for Indian businesses and vice versa, with reduced non-tariff barriers.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Handshake size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Mobility Programs</h3>
            <p className="text-sm text-secondary">
              Facilitated visa processes and work permits for entrepreneurs and skilled professionals.
            </p>
          </div>
        </section>

        {/* For Startups */}
        <section className="bg-surface rounded-3xl border border-secondary/10 p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-bold text-primary-text mb-6">What This Means for Indian Startups</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-primary-text mb-3">Access to European Capital</h4>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Direct investment from EU-based VCs and angel networks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Participation in EU startup programs and accelerators
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Access to EU government grants and innovation funds
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary-text mb-3">Operational Benefits</h4>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Establish EU subsidiaries with simplified procedures
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Hire EU talent without complex work permit processes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Sell into EU markets with reduced regulatory burden
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* For Investors */}
        <section className="bg-accent/5 rounded-3xl border border-accent/20 p-8 md:p-12 mb-16">
          <h2 className="text-2xl font-bold text-primary-text mb-6">What This Means for European Investors</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-primary-text mb-3">Investment Opportunities</h4>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Access to India&apos;s fast-growing startup ecosystem
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Portfolio diversification into emerging market tech
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Co-investment opportunities with top Indian VCs
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-primary-text mb-3">Risk Mitigation</h4>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Enhanced legal protections under FTA framework
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Transparent dispute resolution mechanisms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  Stable regulatory environment for exits
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Compliance Packages */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary-text mb-6 text-center">Our Compliance Packages</h2>
          <p className="text-secondary text-center max-w-2xl mx-auto mb-8">
            STARTUP TALKING offers compliance packages to help you navigate FTA requirements and maximize benefits.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
              <h4 className="font-bold text-primary-text mb-2">Free Tier</h4>
              <p className="text-2xl font-black text-accent mb-4">₹0</p>
              <ul className="text-sm text-secondary space-y-2">
                <li>• Basic profile creation</li>
                <li>• Browse investor directory</li>
                <li>• Limited match requests</li>
              </ul>
            </div>
            <div className="bg-surface p-6 rounded-2xl border-2 border-accent relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
              <h4 className="font-bold text-primary-text mb-2">Growth</h4>
              <p className="text-2xl font-black text-accent mb-4">₹9,999</p>
              <ul className="text-sm text-secondary space-y-2">
                <li>• Everything in Free</li>
                <li>• FTA compliance documentation</li>
                <li>• Unlimited match requests</li>
                <li>• Priority matching</li>
              </ul>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-secondary/10">
              <h4 className="font-bold text-primary-text mb-2">Enterprise</h4>
              <p className="text-2xl font-black text-accent mb-4">₹24,999</p>
              <ul className="text-sm text-secondary space-y-2">
                <li>• Everything in Growth</li>
                <li>• Dedicated account manager</li>
                <li>• Legal consultation</li>
                <li>• Custom investor introductions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-4">Start Leveraging FTA Benefits Today</h2>
          <p className="text-secondary mb-8">Join STARTUP TALKING and connect with investors ready to capitalize on the India-EU FTA.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded-full font-bold hover:scale-105 transition-transform"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              href="/investors"
              className="px-8 py-4 border-2 border-primary-text text-primary-text rounded-full font-bold hover:bg-primary-text hover:text-white transition-all"
            >
              Browse Investors
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
