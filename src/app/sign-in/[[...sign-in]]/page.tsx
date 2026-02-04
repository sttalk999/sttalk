import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-accent hover:bg-accent/90',
            footerActionLink: 'text-accent hover:text-accent/80',
          },
        }}
      />
    </div>
  );
}
