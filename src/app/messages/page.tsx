'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/ui/Header';
import { ChatList, ChatMatch } from '@/components/messaging/ChatList';
import { ChatArea } from '@/components/messaging/ChatArea';
import { getUserMatches } from '@/lib/actions/messaging';
import { Loader2 } from 'lucide-react';

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [matches, setMatches] = useState<ChatMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive profile ID from user
  const currentProfileId = useMemo(() => user?.id || '', [user?.id]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchMatches = async () => {
      setIsLoading(true);
      const result = await getUserMatches();
      if (result.success && result.data) {
        setMatches(result.data as ChatMatch[]);
      }
      setIsLoading(false);
    };

    fetchMatches();
  }, [isLoaded, user]);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const selectedMatchName =
    selectedMatch?.european_investors?.firm_name ||
    selectedMatch?.indian_entities?.company_name ||
    'Unknown';

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header variant="sticky" />

      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar - Chat List */}
        <aside className="w-80 border-r border-secondary/10 bg-surface flex flex-col">
          <div className="p-4 border-b border-secondary/10">
            <h2 className="text-lg font-bold text-primary-text">Messages</h2>
            <p className="text-xs text-secondary">
              {matches.length} conversation{matches.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-grow overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-accent" size={24} />
              </div>
            ) : (
              <ChatList
                matches={matches}
                selectedMatchId={selectedMatchId}
                onSelectMatch={setSelectedMatchId}
              />
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-grow flex flex-col bg-background">
          <ChatArea
            matchId={selectedMatchId}
            matchName={selectedMatchName}
            currentUserId={currentProfileId}
          />
        </main>
      </div>
    </div>
  );
}
