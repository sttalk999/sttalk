'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { InvestorCard } from './InvestorCard';
import { EuropeanInvestor } from '@/lib/supabase';
import { createMatch } from '@/lib/actions/matchmaking';

interface InvestorDirectoryProps {
  investors: EuropeanInvestor[];
  entityId?: string | null;
  existingMatchIds?: string[];
}

export function InvestorDirectory({ investors, entityId, existingMatchIds = [] }: InvestorDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set(existingMatchIds));
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());

  const handleRequestMatch = async (investorId: string) => {
    if (!entityId || matchedIds.has(investorId) || requestingIds.has(investorId)) return;

    setRequestingIds(prev => new Set(prev).add(investorId));

    const result = await createMatch(entityId, investorId, 'entity');

    setRequestingIds(prev => {
      const next = new Set(prev);
      next.delete(investorId);
      return next;
    });

    if (result.success) {
      setMatchedIds(prev => new Set(prev).add(investorId));
    }
  };

  // Extract unique stages from all investors
  const allStages = useMemo(() => {
    const stages = new Set<string>();
    investors.forEach((inv) => {
      if (inv.stages) {
        inv.stages.split(',').forEach((s) => {
          const cleaned = s.trim();
          if (cleaned) stages.add(cleaned);
        });
      }
    });
    return Array.from(stages).sort();
  }, [investors]);

  // Filter investors based on search and filters
  const filteredInvestors = useMemo(() => {
    return investors.filter((investor) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        investor.firm_name?.toLowerCase().includes(searchLower) ||
        investor.investment_thesis?.toLowerCase().includes(searchLower) ||
        investor.investment_focus?.toLowerCase().includes(searchLower) ||
        investor.hq_location?.toLowerCase().includes(searchLower);

      // Stage filter
      const matchesStage =
        stageFilter === 'all' ||
        investor.stages?.toLowerCase().includes(stageFilter.toLowerCase());

      return matchesSearch && matchesStage;
    });
  }, [investors, searchQuery, stageFilter]);

  // Helper to parse stages string into array
  const parseStages = (stages: string | undefined): string[] => {
    if (!stages) return [];
    return stages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 badges
  };

  // Helper to extract investor type as "sector" badge
  const getTypeBadge = (type: string | undefined): string[] => {
    if (!type) return [];
    return [type];
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, location, or thesis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-secondary/20 rounded-full text-primary-text placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 border rounded-full font-medium flex items-center gap-2 transition-all ${
            showFilters
              ? 'bg-accent text-white border-accent'
              : 'bg-surface border-secondary/20 text-secondary hover:border-accent hover:text-accent'
          }`}
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-surface border border-secondary/10 rounded-2xl p-6 mb-8">
          <h4 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">
            Investment Stage
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStageFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                stageFilter === 'all'
                  ? 'bg-accent text-white'
                  : 'bg-secondary/5 text-secondary hover:bg-secondary/10'
              }`}
            >
              All Stages
            </button>
            {allStages.map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  stageFilter === stage
                    ? 'bg-accent text-white'
                    : 'bg-secondary/5 text-secondary hover:bg-secondary/10'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-secondary mb-6">
        Showing {filteredInvestors.length} of {investors.length} investors
      </p>

      {/* Investor Grid */}
      {filteredInvestors.length > 0 ? (
        <div className="grid gap-6">
          {filteredInvestors.map((investor, index) => (
            <InvestorCard
              key={investor.id || index}
              investorId={investor.id}
              firmName={investor.firm_name}
              sectors={getTypeBadge(investor.investor_type)}
              stages={parseStages(investor.stages)}
              thesisTeaser={
                investor.investment_thesis?.slice(0, 200) +
                (investor.investment_thesis && investor.investment_thesis.length > 200 ? '...' : '')
              }
              isLocked={!entityId}
              isMatched={matchedIds.has(investor.id)}
              isRequesting={requestingIds.has(investor.id)}
              onRequestMatch={entityId ? handleRequestMatch : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-secondary/10">
          <p className="text-secondary text-lg mb-2">No investors found</p>
          <p className="text-secondary/60 text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
