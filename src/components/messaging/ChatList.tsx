'use client';

import { MessageSquare } from 'lucide-react';

export interface ChatMatch {
  id: string;
  status: string;
  created_at: string;
  // For Indian entities viewing investors
  european_investors?: {
    id: string;
    firm_name: string;
    investor_type: string;
  };
  // For investors viewing entities
  indian_entities?: {
    id: string;
    company_name: string;
    industry: string;
  };
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatListProps {
  matches: ChatMatch[];
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
}

export function ChatList({ matches, selectedMatchId, onSelectMatch }: ChatListProps) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare size={48} className="text-secondary/30 mb-4" />
        <p className="text-secondary font-medium">No conversations yet</p>
        <p className="text-sm text-secondary/60 mt-1">
          Your matches will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-secondary/10">
      {matches.map((match) => {
        const name = match.european_investors?.firm_name || match.indian_entities?.company_name || 'Unknown';
        const subtitle = match.european_investors?.investor_type || match.indian_entities?.industry || '';
        const isSelected = selectedMatchId === match.id;

        return (
          <button
            key={match.id}
            onClick={() => onSelectMatch(match.id)}
            className={`w-full p-4 text-left transition-colors ${
              isSelected
                ? 'bg-accent/10'
                : 'hover:bg-secondary/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                isSelected ? 'bg-accent text-white' : 'bg-secondary/10 text-secondary'
              }`}>
                {name.charAt(0)}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold truncate ${
                    isSelected ? 'text-accent' : 'text-primary-text'
                  }`}>
                    {name}
                  </h4>
                  {match.unreadCount && match.unreadCount > 0 && (
                    <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {match.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-secondary truncate">{subtitle}</p>
                {match.lastMessage && (
                  <p className="text-xs text-secondary/60 truncate mt-1">
                    {match.lastMessage}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
