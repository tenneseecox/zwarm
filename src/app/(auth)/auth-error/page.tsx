// src/app/auth/auth-error/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || "An unknown authentication error occurred.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="glass-dark p-8 rounded-zwarm shadow-zwarm-dark max-w-md w-full">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-6">{decodeURIComponent(errorMessage)}</p>
        <Link href="/sign-in" className="text-yellow-400 hover:text-yellow-500 underline">
          Try signing in again
        </Link>
        <br />
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-400 mt-4 inline-block">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="glass-dark p-8 rounded-zwarm shadow-zwarm-dark max-w-md w-full">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}