'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { IndianEntity, EuropeanInvestor } from '@/lib/supabase';

// =====================================================
// Match Scoring Algorithm
// =====================================================

interface MatchScore {
  investorId: string;
  investorName: string;
  score: number;
  reasons: string[];
}

// Industry mapping - maps Indian entity industries to investor focus areas
const INDUSTRY_MAPPING: Record<string, string[]> = {
  'Technology': ['Software', 'Technology', 'SaaS', 'B2B', 'Enterprise', 'Tech'],
  'FinTech': ['FinTech', 'Financial Services', 'Banking', 'Payments', 'Finance'],
  'HealthTech': ['HealthTech', 'Healthcare', 'MedTech', 'BioTech', 'Health'],
  'EdTech': ['EdTech', 'Education', 'Learning', 'E-learning'],
  'E-commerce': ['E-commerce', 'Retail', 'Consumer', 'D2C', 'Marketplace'],
  'CleanTech': ['CleanTech', 'Climate', 'Sustainability', 'Energy', 'Green'],
  'AgriTech': ['AgriTech', 'Agriculture', 'Food', 'FoodTech'],
  'Logistics': ['Logistics', 'Supply Chain', 'Transportation', 'Mobility'],
  'Real Estate': ['Real Estate', 'PropTech', 'Construction'],
  'Media': ['Media', 'Entertainment', 'Content', 'Gaming'],
  'Manufacturing': ['Manufacturing', 'Industrial', 'Hardware'],
  'AI/ML': ['AI', 'ML', 'Artificial Intelligence', 'Machine Learning', 'Deep Tech'],
};

// Stage mapping
const STAGE_MAPPING: Record<string, string[]> = {
  'Pre-Seed': ['Pre-Seed', 'Pre Seed', 'Idea', 'Angel'],
  'Seed': ['Seed', 'Early Stage', 'Angel'],
  'Series A': ['Series A', 'Growth', 'Early Growth'],
  'Series B': ['Series B', 'Growth', 'Expansion'],
  'Series C+': ['Series C', 'Series D', 'Late Stage', 'Growth', 'Expansion'],
  'Growth': ['Growth', 'Late Stage', 'Expansion', 'Series B', 'Series C'],
};

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function calculateIndustryScore(entityIndustry: string | null, investorFocus: string): number {
  if (!entityIndustry) return 0;

  const normalizedEntity = normalizeText(entityIndustry);
  const normalizedFocus = normalizeText(investorFocus);

  // Direct match
  if (normalizedFocus.includes(normalizedEntity) || normalizedEntity.includes(normalizedFocus)) {
    return 40;
  }

  // Check mapping
  const mappedKeywords = INDUSTRY_MAPPING[entityIndustry] || [];
  for (const keyword of mappedKeywords) {
    if (normalizedFocus.includes(normalizeText(keyword))) {
      return 35;
    }
  }

  // Partial keyword match
  const entityWords = normalizedEntity.split(/[\s,\/]+/);
  const focusWords = normalizedFocus.split(/[\s,\/]+/);

  for (const entityWord of entityWords) {
    if (entityWord.length > 3 && focusWords.some(fw => fw.includes(entityWord) || entityWord.includes(fw))) {
      return 25;
    }
  }

  // "Generalist" or "Sector agnostic" investors get partial score
  if (normalizedFocus.includes('generalist') || normalizedFocus.includes('agnostic') || normalizedFocus.includes('all sectors')) {
    return 20;
  }

  return 0;
}

function calculateStageScore(entityStage: string | null, investorStages: string): number {
  if (!entityStage) return 0;

  const normalizedEntityStage = normalizeText(entityStage);
  const normalizedInvestorStages = normalizeText(investorStages);

  // Direct match
  if (normalizedInvestorStages.includes(normalizedEntityStage)) {
    return 30;
  }

  // Check mapping
  const mappedStages = STAGE_MAPPING[entityStage] || [];
  for (const stage of mappedStages) {
    if (normalizedInvestorStages.includes(normalizeText(stage))) {
      return 25;
    }
  }

  // "All stages" investors
  if (normalizedInvestorStages.includes('all') || normalizedInvestorStages.includes('any')) {
    return 15;
  }

  return 0;
}

function calculateLocationScore(investorLocation: string): number {
  const normalizedLocation = normalizeText(investorLocation);

  // European investors are all relevant under FTA, but prefer those with Asia/India focus
  if (normalizedLocation.includes('india') || normalizedLocation.includes('asia') || normalizedLocation.includes('emerging')) {
    return 15;
  }

  // UK and EU get base score
  if (normalizedLocation.includes('uk') || normalizedLocation.includes('london') ||
      normalizedLocation.includes('germany') || normalizedLocation.includes('france') ||
      normalizedLocation.includes('netherlands') || normalizedLocation.includes('europe')) {
    return 10;
  }

  return 5;
}

function calculateThesisScore(entityDescription: string | null, investorThesis: string): number {
  if (!entityDescription) return 5;

  const entityWords = normalizeText(entityDescription).split(/\s+/).filter(w => w.length > 4);
  const thesisWords = normalizeText(investorThesis).split(/\s+/).filter(w => w.length > 4);

  let matches = 0;
  for (const word of entityWords) {
    if (thesisWords.some(tw => tw.includes(word) || word.includes(tw))) {
      matches++;
    }
  }

  // Normalize by entity description length
  const matchRatio = matches / Math.max(entityWords.length, 1);
  return Math.min(15, Math.round(matchRatio * 30));
}

export async function scoreMatch(entity: IndianEntity, investor: EuropeanInvestor): Promise<MatchScore> {
  const reasons: string[] = [];
  let totalScore = 0;

  // Industry match (40 points max)
  const industryScore = calculateIndustryScore(entity.industry, investor.investment_focus);
  if (industryScore > 0) {
    reasons.push(`Industry alignment: ${entity.industry} ↔ ${investor.investment_focus}`);
  }
  totalScore += industryScore;

  // Stage match (30 points max)
  const stageScore = calculateStageScore(entity.stage, investor.stages);
  if (stageScore > 0) {
    reasons.push(`Stage match: ${entity.stage} fits ${investor.stages}`);
  }
  totalScore += stageScore;

  // Location/Geographic focus (15 points max)
  const locationScore = calculateLocationScore(investor.hq_location);
  if (locationScore > 10) {
    reasons.push(`Geographic focus includes Asia/India`);
  }
  totalScore += locationScore;

  // Investment thesis alignment (15 points max)
  const thesisScore = calculateThesisScore(entity.description, investor.investment_thesis);
  if (thesisScore > 5) {
    reasons.push(`Investment thesis alignment`);
  }
  totalScore += thesisScore;

  return {
    investorId: investor.id,
    investorName: investor.firm_name,
    score: totalScore,
    reasons,
  };
}

// =====================================================
// Matchmaking Actions
// =====================================================

export async function findMatchesForEntity(entityId: string): Promise<{
  success: boolean;
  matches?: MatchScore[];
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    // Get the entity
    const { data: entity, error: entityError } = await supabase
      .from('indian_entities')
      .select('*')
      .eq('id', entityId)
      .single() as { data: IndianEntity | null; error: Error | null };

    if (entityError || !entity) {
      return { success: false, error: 'Entity not found' };
    }

    // Get all investors
    const { data: investors, error: investorsError } = await supabase
      .from('european_investors')
      .select('*') as { data: EuropeanInvestor[] | null; error: Error | null };

    if (investorsError || !investors) {
      return { success: false, error: 'Failed to fetch investors' };
    }

    // Get existing matches to exclude
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('investor_id')
      .eq('indian_entity_id', entityId) as { data: Array<{ investor_id: string }> | null };

    const existingInvestorIds = new Set((existingMatches || []).map(m => m.investor_id));

    // Score all investors
    const scores: MatchScore[] = [];
    for (const investor of investors) {
      if (existingInvestorIds.has(investor.id)) continue;

      const score = await scoreMatch(entity as IndianEntity, investor as EuropeanInvestor);
      if (score.score >= 40) { // Minimum threshold for a good match
        scores.push(score);
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Return top 10 matches
    return { success: true, matches: scores.slice(0, 10) };
  } catch (error) {
    console.error('Error finding matches:', error);
    return { success: false, error: 'Failed to find matches' };
  }
}

export async function createMatch(
  entityId: string,
  investorId: string,
  initiatedBy: 'entity' | 'investor' = 'entity'
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();

    // Check if match already exists
    const { data: existing } = await supabase
      .from('matches')
      .select('id')
      .eq('indian_entity_id', entityId)
      .eq('investor_id', investorId)
      .single() as { data: { id: string } | null };

    if (existing) {
      return { success: false, error: 'Match already exists' };
    }

    // Create the match
    const { data: match, error } = await (supabase
      .from('matches') as any)
      .insert({
        indian_entity_id: entityId,
        investor_id: investorId,
        status: 'Pending',
        initiated_by: initiatedBy,
      })
      .select('id')
      .single() as { data: { id: string } | null; error: Error | null };

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, matchId: match?.id };
  } catch (error) {
    console.error('Error creating match:', error);
    return { success: false, error: 'Failed to create match' };
  }
}

export async function runAutoMatching(entityId: string): Promise<{
  success: boolean;
  matchesCreated?: number;
  error?: string;
}> {
  try {
    // Find potential matches
    const matchResult = await findMatchesForEntity(entityId);

    if (!matchResult.success || !matchResult.matches) {
      return { success: false, error: matchResult.error };
    }

    // Create matches for top 5 investors (auto-matching)
    const topMatches = matchResult.matches.slice(0, 5);
    let created = 0;

    for (const match of topMatches) {
      const result = await createMatch(entityId, match.investorId, 'entity');
      if (result.success) {
        created++;
      }
    }

    return { success: true, matchesCreated: created };
  } catch (error) {
    console.error('Error in auto-matching:', error);
    return { success: false, error: 'Auto-matching failed' };
  }
}

// Admin function to get match analytics
export async function getMatchAnalytics(): Promise<{
  success: boolean;
  data?: {
    totalMatches: number;
    matchesByStatus: Record<string, number>;
    recentMatches: Array<{
      id: string;
      entityName: string;
      investorName: string;
      status: string;
      createdAt: string;
    }>;
  };
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();

    // Get total matches
    const { count: totalMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true }) as { count: number | null };

    // Get matches by status
    const { data: statusData } = await supabase
      .from('matches')
      .select('status') as { data: Array<{ status: string }> | null };

    const matchesByStatus: Record<string, number> = {};
    for (const match of statusData || []) {
      matchesByStatus[match.status] = (matchesByStatus[match.status] || 0) + 1;
    }

    // Get recent matches with details
    const { data: recentData } = await supabase
      .from('matches')
      .select(`
        id,
        status,
        created_at,
        indian_entities (company_name),
        european_investors (firm_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10) as { data: Array<{
        id: string;
        status: string;
        created_at: string;
        indian_entities: { company_name: string } | null;
        european_investors: { firm_name: string } | null;
      }> | null };

    const recentMatches = (recentData || []).map((m) => ({
      id: m.id,
      entityName: m.indian_entities?.company_name || 'Unknown',
      investorName: m.european_investors?.firm_name || 'Unknown',
      status: m.status,
      createdAt: m.created_at,
    }));

    return {
      success: true,
      data: {
        totalMatches: totalMatches || 0,
        matchesByStatus,
        recentMatches,
      },
    };
  } catch (error) {
    console.error('Error getting match analytics:', error);
    return { success: false, error: 'Failed to get analytics' };
  }
}
