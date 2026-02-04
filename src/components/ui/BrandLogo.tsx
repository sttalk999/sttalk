import React from 'react';

interface BrandLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-3xl',
        lg: 'text-5xl',
    };

    return (
        <div className={`font-bold tracking-tight text-foreground ${sizeClasses[size]} ${className}`}>
            STARTUP T<span className="text-accent underline decoration-2 underline-offset-4">A</span>LKING
        </div>
    );
};
