import { Header } from '@/components/ui/Header';
import { Rocket, Target, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StartupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="sticky" />

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-primary-text mb-6">
            For Indian <span className="text-accent">Startups</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto mb-8">
            Connect with verified European investors actively seeking Indian startups under the 2026 India-EU Free Trade Agreement.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            Get Started <ArrowRight size={20} />
          </Link>
        </section>

        {/* Benefits Grid */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-surface p-8 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Target size={24} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-primary-text mb-3">Targeted Matching</h3>
            <p className="text-secondary">
              Our AI-powered matching engine connects you with investors whose thesis, stage preference, and sector focus align with your startup.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-primary-text mb-3">4000+ Investors</h3>
            <p className="text-secondary">
              Access our curated database of European and global investors actively deploying capital in emerging markets.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Rocket size={24} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-primary-text mb-3">FTA Advantages</h3>
            <p className="text-secondary">
              Leverage the 2026 India-EU Free Trade Agreement benefits including reduced barriers, tax incentives, and streamlined compliance.
            </p>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-secondary/10">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-primary-text mb-3">Direct Messaging</h3>
            <p className="text-secondary">
              Once matched, communicate directly with investors through our secure messaging platform. No middlemen, no delays.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface rounded-3xl border border-secondary/10 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-primary-text mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
              <h4 className="font-bold text-primary-text mb-2">Create Profile</h4>
              <p className="text-sm text-secondary">Complete your company profile with industry, stage, and location details.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
              <h4 className="font-bold text-primary-text mb-2">Upload Deck</h4>
              <p className="text-sm text-secondary">Share your pitch deck to enable AI-powered investor matching.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
              <h4 className="font-bold text-primary-text mb-2">Get Matched</h4>
              <p className="text-sm text-secondary">Receive matches based on sector, stage, and investment thesis alignment.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">4</div>
              <h4 className="font-bold text-primary-text mb-2">Connect</h4>
              <p className="text-sm text-secondary">Message investors directly and start your funding journey.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mt-16">
          <h2 className="text-2xl font-bold text-primary-text mb-4">Ready to Get Funded?</h2>
          <p className="text-secondary mb-8">Join hundreds of Indian startups already connecting with European capital.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-accent text-white rounded-full font-bold hover:scale-105 transition-transform"
            >
              Start Onboarding
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
