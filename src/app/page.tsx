import { Header } from '@/components/ui/Header';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import { InvestorCard } from '@/components/investors/InvestorCard';
import { Handshake, Search, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto p-8 md:p-16">
        {/* Hero Section Mockup */}
        <section className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black text-primary-text mb-6 leading-tight">
            From Vision <span className="text-accent underline decoration-4 underline-offset-8">To Velocity</span>
          </h2>
          <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl mx-auto">
            The premium B2B matchmaking platform connecting Indian growth-stage startups with European capital under the 2026 FTA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/investors" className="px-8 py-4 bg-accent text-white rounded-full font-bold text-lg hover:scale-105 transition-transform text-center">
              Get Funded
            </Link>
            <button className="px-8 py-4 border-2 border-primary-text text-primary-text rounded-full font-bold text-lg hover:bg-primary-text hover:text-white transition-all">
              Find Startups
            </button>
          </div>
        </section>

        {/* Component Showcase */}
        <section className="grid gap-16">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-8">Component: Investor Card</h3>
            <InvestorCard
              firmName="Lumina Ventures"
              sectors={['Fintech', 'Clean Energy']}
              stages={['Seed', 'Series A']}
              thesisTeaser="We invest in high-impact technology solutions that bridge the gap between emerging markets and European institutional capital."
              isLocked={true}
            />
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-8">Component: Speech Bubbles</h3>
            <div className="max-w-md mx-auto bg-surface p-8 rounded-3xl border border-secondary/10 shadow-sm">
              <SpeechBubble
                variant="investor"
                content="Hello! We saw your pitch deck for the Clean Energy initiative. Very impressive."
                timestamp="2:14 PM"
              />
              <SpeechBubble
                variant="startup"
                content="Thank you! We'd love to discuss how we align with your 2026 mobility thesis."
                timestamp="2:16 PM"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-32 pt-8 border-t border-secondary/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-secondary">© 2026 STARTUP TALKING. All rights reserved.</p>
        <div className="flex gap-6 text-secondary">
          <Rocket size={16} />
          <Search size={16} />
          <Handshake size={16} />
        </div>
      </footer>
    </div>
  );
}

