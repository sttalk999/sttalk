'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  variant?: 'default' | 'sticky';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const headerClass = variant === 'sticky'
    ? 'sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-secondary/10'
    : '';

  return (
    <header className={headerClass}>
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <BrandLogo size="sm" />
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-secondary">
            <Link
              href="/investors"
              className={`transition-colors ${isActive('/investors') ? 'text-accent' : 'hover:text-accent'}`}
            >
              Investors
            </Link>
            <Link
              href="/startups"
              className={`transition-colors ${isActive('/startups') ? 'text-accent' : 'hover:text-accent'}`}
            >
              Startups
            </Link>
            <Link
              href="/fta-benefits"
              className={`transition-colors ${isActive('/fta-benefits') ? 'text-accent' : 'hover:text-accent'}`}
            >
              FTA Benefits
            </Link>
          </nav>

          {/* Auth UI */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-bold text-primary-text hover:text-accent transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent/90 transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/admin"
                className={`transition-colors ${isActive('/admin') ? 'text-accent' : 'text-secondary hover:text-accent'}`}
                title="Admin Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </Link>
              <Link
                href="/messages"
                className={`transition-colors ${isActive('/messages') ? 'text-accent' : 'text-secondary hover:text-accent'}`}
                title="Messages"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                </svg>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
