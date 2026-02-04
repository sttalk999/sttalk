import React from 'react';

interface SpeechBubbleProps {
    content: string;
    variant: 'investor' | 'startup';
    timestamp?: string;
    className?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
    content,
    variant,
    timestamp,
    className = ''
}) => {
    const isInvestor = variant === 'investor';

    return (
        <div className={`flex w-full mb-4 ${isInvestor ? 'justify-start' : 'justify-end'} ${className}`}>
            <div className={`relative max-w-[80%] px-4 py-3 rounded-2xl shadow-sm text-sm ${isInvestor
                    ? 'bg-surface text-primary-text rounded-bl-none border border-secondary/20'
                    : 'bg-accent text-white rounded-br-none'
                }`}>
                <p className="leading-relaxed">{content}</p>
                {timestamp && (
                    <span className={`text-[10px] mt-1 block ${isInvestor ? 'text-secondary' : 'text-white/80'}`}>
                        {timestamp}
                    </span>
                )}

                {/* Simple CSS tail approximation */}
                <div className={`absolute bottom-0 w-3 h-3 ${isInvestor
                        ? 'left-0 -mb-[1px] -ml-[6px] text-surface fill-current'
                        : 'right-0 -mb-[1px] -mr-[6px] text-accent fill-current'
                    }`}>
                    <svg viewBox="0 0 10 10">
                        <path d={isInvestor ? "M10 0 L10 10 L0 10 Z" : "M0 0 L0 10 L10 10 Z"} />
                    </svg>
                </div>
            </div>
        </div>
    );
};
