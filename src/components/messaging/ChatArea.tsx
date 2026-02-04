'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { SpeechBubble } from '@/components/ui/SpeechBubble';
import { supabase } from '@/lib/supabase';
import { getMatchMessages, sendMessage } from '@/lib/actions/messaging';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
}

interface ChatAreaProps {
  matchId: string | null;
  matchName: string;
  currentUserId: string;
}

export function ChatArea({ matchId, matchName, currentUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when match changes
  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;

    const fetchMessages = async () => {
      setIsLoading(true);
      // Clear previous messages when starting to fetch new ones
      setMessages([]);

      const result = await getMatchMessages(matchId);
      if (!cancelled && result.success && result.data) {
        setMessages(result.data as Message[]);
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    const result = await sendMessage(matchId, messageContent);

    if (!result.success) {
      // Restore message if failed
      setNewMessage(messageContent);
      console.error('Failed to send message:', result.error);
    }

    setIsSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!matchId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-secondary/5 text-center p-8">
        <MessageSquare size={64} className="text-secondary/20 mb-4" />
        <h3 className="text-xl font-bold text-primary-text mb-2">
          Select a conversation
        </h3>
        <p className="text-secondary max-w-sm">
          Choose a match from the list to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary/10 bg-surface">
        <h3 className="font-bold text-primary-text">{matchName}</h3>
        <p className="text-xs text-secondary">Connected</p>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-secondary">No messages yet</p>
            <p className="text-sm text-secondary/60 mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <SpeechBubble
              key={message.id}
              variant={message.sender_id === currentUserId ? 'startup' : 'investor'}
              content={message.content}
              timestamp={formatTime(message.created_at)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-secondary/10 bg-surface">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-grow px-4 py-3 bg-background border border-secondary/20 rounded-full text-primary-text placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-3 bg-accent text-white rounded-full font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
