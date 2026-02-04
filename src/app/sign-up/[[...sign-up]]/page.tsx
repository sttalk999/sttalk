import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <SignUp
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
