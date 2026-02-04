'use client';

import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/ui/Header';
import { Rocket, Users, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

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

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-primary-text mb-2">
            Welcome back, {user?.firstName || 'Founder'}!
          </h1>
          <p className="text-secondary">
            Here&apos;s an overview of your startup&apos;s investor connections.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface rounded-2xl border border-secondary/10 p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} className="text-accent" />
            </div>
            <p className="text-3xl font-black text-primary-text">0</p>
            <p className="text-sm text-secondary">Investor Matches</p>
          </div>

          <div className="bg-surface rounded-2xl border border-secondary/10 p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-accent" />
            </div>
            <p className="text-3xl font-black text-primary-text">0</p>
            <p className="text-sm text-secondary">Active Conversations</p>
          </div>

          <div className="bg-surface rounded-2xl border border-secondary/10 p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Rocket size={24} className="text-accent" />
            </div>
            <p className="text-3xl font-black text-primary-text">0</p>
            <p className="text-sm text-secondary">Intro Requests Sent</p>
          </div>

          <div className="bg-surface rounded-2xl border border-secondary/10 p-6">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <FileText size={24} className="text-accent" />
            </div>
            <p className="text-3xl font-black text-primary-text">0</p>
            <p className="text-sm text-secondary">Profile Views</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/investors"
            className="group bg-surface rounded-2xl border border-secondary/10 p-6 hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-accent" />
              </div>
              <ArrowRight size={20} className="text-secondary group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Browse Investors</h3>
            <p className="text-sm text-secondary">
              Explore our directory of 500+ European investors actively seeking Indian startups.
            </p>
          </Link>

          <Link
            href="/onboarding"
            className="group bg-surface rounded-2xl border border-secondary/10 p-6 hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-accent" />
              </div>
              <ArrowRight size={20} className="text-secondary group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Complete Your Profile</h3>
            <p className="text-sm text-secondary">
              Finish setting up your company profile to unlock investor matching.
            </p>
          </Link>
        </div>

        {/* Empty State / Coming Soon */}
        <div className="mt-12 bg-secondary/5 rounded-2xl p-12 text-center">
          <Rocket size={48} className="mx-auto text-secondary/30 mb-4" />
          <h3 className="text-xl font-bold text-primary-text mb-2">Your journey starts here</h3>
          <p className="text-secondary max-w-md mx-auto mb-6">
            Complete your profile and start connecting with European investors under the 2026 FTA framework.
          </p>
          <Link
            href="/investors"
            className="inline-block px-8 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent/90 transition-colors"
          >
            Explore Investors
          </Link>
        </div>
      </main>
    </div>
  );
}
