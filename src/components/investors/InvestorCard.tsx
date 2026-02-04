import React from 'react';
import { MessageSquareShare, Loader2, Check } from 'lucide-react';

interface InvestorCardProps {
    investorId?: string;
    firmName: string;
    sectors: string[];
    stages: string[];
    thesisTeaser: string;
    isLocked?: boolean;
    isMatched?: boolean;
    isRequesting?: boolean;
    onRequestMatch?: (investorId: string) => void;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
    investorId,
    firmName,
    sectors,
    stages,
    thesisTeaser,
    isLocked = true,
    isMatched = false,
    isRequesting = false,
    onRequestMatch,
}) => {
    return (
        <div className="group relative bg-surface p-6 rounded-xl border border-secondary/10 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col md:flex-row md:items-center md:gap-8">
            {/* Entity Initial/Logo Placeholder */}
            <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-2xl mb-4 md:mb-0 shrink-0">
                {firmName.charAt(0)}
            </div>

            <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                    {sectors.map((sector) => (
                        <span key={sector} className="px-2 py-0.5 bg-secondary/5 text-secondary text-[10px] uppercase tracking-wider rounded font-medium">
                            {sector}
                        </span>
                    ))}
                    {stages.map((stage) => (
                        <span key={stage} className="px-2 py-0.5 bg-accent/5 text-accent text-[10px] uppercase tracking-wider rounded font-medium">
                            {stage}
                        </span>
                    ))}
                </div>

                <h3 className="text-xl font-bold text-primary-text mb-2 group-hover:text-accent transition-colors">
                    {firmName}
                </h3>

                <div className="relative">
                    <p className={`text-sm text-secondary leading-relaxed ${isLocked ? 'blur-[3px] select-none' : ''}`}>
                        {thesisTeaser}
                    </p>
                    {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary-text/60 uppercase tracking-widest bg-surface/80 px-2 py-1 rounded">
                                Entity Only Access
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => investorId && onRequestMatch?.(investorId)}
                disabled={isMatched || isRequesting || !onRequestMatch || !investorId}
                className={`mt-4 md:mt-0 px-6 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all focus:ring-2 focus:ring-accent/20 ${
                    isMatched
                        ? 'bg-green-500 text-white cursor-default'
                        : isRequesting
                        ? 'bg-secondary/20 text-secondary cursor-wait'
                        : 'bg-accent text-white hover:bg-accent/90'
                } ${!onRequestMatch ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isRequesting ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Requesting...
                    </>
                ) : isMatched ? (
                    <>
                        <Check size={18} />
                        Matched
                    </>
                ) : (
                    <>
                        <MessageSquareShare size={18} />
                        Request Intro
                    </>
                )}
            </button>
        </div>
    );
};
