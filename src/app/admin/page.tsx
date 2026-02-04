'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/ui/Header';
import {
  getPlatformStats,
  getRecentActivity,
  getMatchStatusDistribution,
  getIndustryDistribution,
  getAllEntities,
  verifyEntity,
  PlatformStats,
  RecentActivity,
} from '@/lib/actions/admin';
import {
  Loader2,
  Users,
  Building2,
  Handshake,
  MessageSquare,
  Clock,
  TrendingUp,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { isLoaded } = useUser();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [matchDistribution, setMatchDistribution] = useState<Record<string, number>>({});
  const [industryDistribution, setIndustryDistribution] = useState<Record<string, number>>({});
  const [entities, setEntities] = useState<Array<{
    id: string;
    companyName: string;
    industry: string | null;
    stage: string | null;
    isVerified: boolean;
    onboardingCompleted: boolean;
    createdAt: string;
    matchCount: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'activity'>('overview');

  useEffect(() => {
    if (!isLoaded) return;

    const fetchData = async () => {
      setIsLoading(true);

      const [statsResult, activityResult, matchResult, industryResult, entitiesResult] = await Promise.all([
        getPlatformStats(),
        getRecentActivity(15),
        getMatchStatusDistribution(),
        getIndustryDistribution(),
        getAllEntities(),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
      if (activityResult.success && activityResult.data) {
        setActivity(activityResult.data);
      }
      if (matchResult.success && matchResult.data) {
        setMatchDistribution(matchResult.data);
      }
      if (industryResult.success && industryResult.data) {
        setIndustryDistribution(industryResult.data);
      }
      if (entitiesResult.success && entitiesResult.data) {
        setEntities(entitiesResult.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [isLoaded]);

  const handleVerifyEntity = async (entityId: string) => {
    const result = await verifyEntity(entityId);
    if (result.success) {
      setEntities(prev => prev.map(e =>
        e.id === entityId ? { ...e, isVerified: true } : e
      ));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'signup':
        return <Users size={16} className="text-blue-500" />;
      case 'onboarding':
        return <Building2 size={16} className="text-green-500" />;
      case 'match':
        return <Handshake size={16} className="text-accent" />;
      case 'message':
        return <MessageSquare size={16} className="text-purple-500" />;
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="sticky" />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text">Admin Dashboard</h1>
          <p className="text-secondary mt-1">Platform analytics and management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-secondary/10">
          {(['overview', 'entities', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold capitalize transition-colors ${activeTab === tab
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-secondary hover:text-primary-text'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Users className="text-blue-500" />}
                label="Total Users"
                value={stats.totalProfiles}
                subtext={`${stats.completedOnboarding} completed onboarding`}
              />
              <StatCard
                icon={<Building2 className="text-green-500" />}
                label="Indian Entities"
                value={stats.totalEntities}
                subtext={`${stats.verifiedEntities} verified`}
              />
              <StatCard
                icon={<TrendingUp className="text-purple-500" />}
                label="European Investors"
                value={stats.totalInvestors}
                subtext="Available for matching"
              />
              <StatCard
                icon={<Handshake className="text-accent" />}
                label="Total Matches"
                value={stats.totalMatches}
                subtext={`${stats.activeConversations} connected`}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Match Status Distribution */}
              <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
                <h3 className="font-bold text-primary-text mb-4">Match Status Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(matchDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-secondary">{status}</div>
                      <div className="flex-grow bg-secondary/10 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getStatusColor(status)}`}
                          style={{
                            width: `${Math.max(5, (count / Math.max(stats.totalMatches, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="w-12 text-right text-sm font-semibold text-primary-text">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry Distribution */}
              <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
                <h3 className="font-bold text-primary-text mb-4">Entities by Industry</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(industryDistribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([industry, count]) => (
                      <div key={industry} className="flex items-center gap-3">
                        <div className="w-32 text-sm text-secondary truncate">{industry}</div>
                        <div className="flex-grow bg-secondary/10 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${Math.max(5, (count / Math.max(stats.totalEntities, 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-semibold text-primary-text">{count}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Messages Stats */}
            <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <MessageSquare className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-text">{stats.totalMessages}</p>
                  <p className="text-secondary">Total Messages Exchanged</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <div className="bg-surface rounded-2xl border border-secondary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary-text">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary-text">Industry</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary-text">Stage</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary-text">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary-text">Matches</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary-text">Created</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary-text">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/10">
                  {entities.map(entity => (
                    <tr key={entity.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-primary-text">{entity.companyName}</p>
                      </td>
                      <td className="px-6 py-4 text-secondary">{entity.industry || '—'}</td>
                      <td className="px-6 py-4 text-secondary">{entity.stage || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {entity.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <BadgeCheck size={12} />
                              Verified
                            </span>
                          ) : entity.onboardingCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                              <Clock size={12} />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">
                              <AlertCircle size={12} />
                              Incomplete
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-accent/10 text-accent font-bold rounded-full">
                          {entity.matchCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">{formatDate(entity.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {!entity.isVerified && entity.onboardingCompleted && (
                          <button
                            onClick={() => handleVerifyEntity(entity.id)}
                            className="px-3 py-1.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {entities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                        No entities found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-surface rounded-2xl border border-secondary/10 p-6">
            <h3 className="font-bold text-primary-text mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {activity.map(item => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-background rounded-xl">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-primary-text">{item.description}</p>
                    <p className="text-sm text-secondary mt-1">{formatDate(item.timestamp)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActivityBadgeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-center text-secondary py-8">No recent activity</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Components
function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
}) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-secondary/10 rounded-xl">{icon}</div>
        <span className="text-secondary font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-primary-text">{value.toLocaleString()}</p>
      <p className="text-sm text-secondary mt-1">{subtext}</p>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-400';
    case 'TeaserRevealed':
      return 'bg-blue-400';
    case 'FullReveal':
      return 'bg-purple-400';
    case 'Connected':
      return 'bg-green-500';
    case 'Declined':
      return 'bg-red-400';
    default:
      return 'bg-secondary';
  }
}

function getActivityBadgeColor(type: RecentActivity['type']): string {
  switch (type) {
    case 'signup':
      return 'bg-blue-100 text-blue-700';
    case 'onboarding':
      return 'bg-green-100 text-green-700';
    case 'match':
      return 'bg-accent/20 text-accent';
    case 'message':
      return 'bg-purple-100 text-purple-700';
  }
}
