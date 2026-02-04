import { InvestorDirectory } from '@/components/investors/InvestorDirectory';
import { Header } from '@/components/ui/Header';
import { getInvestors, getUserEntityAndMatches } from '@/lib/actions/investors';

export const dynamic = 'force-dynamic';

export default async function InvestorsPage() {
  const [investors, userEntityData] = await Promise.all([
    getInvestors(),
    getUserEntityAndMatches(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header variant="sticky" />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-primary-text mb-4">
            European Investor Directory
          </h1>
          <p className="text-lg text-secondary max-w-2xl">
            Browse {investors.length > 0 ? `${investors.length}+` : ''} verified European investors actively seeking Indian startups under the 2026 FTA framework.
          </p>
        </div>

        <InvestorDirectory
          investors={investors}
          entityId={userEntityData.entityId}
          existingMatchIds={userEntityData.existingMatchIds}
        />
      </main>
    </div>
  );
}
