import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import Image from 'next/image';

export default function Login() {
  const { user, loading, verifyPhoneNumber, confirmCode } = useAuth();
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    // Format phone number - simple formatting for US numbers
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      // Assume US number if no country code
      formattedNumber = `+1${formattedNumber.replace(/\D/g, '')}`;
    }

    try {
      const verificationId = await verifyPhoneNumber(formattedNumber);
      setVerificationId(verificationId);
      setIsVerifying(false);
    } catch (error) {
      setError('Could not send verification code. Please check your phone number and try again.');
      setIsVerifying(false);
      console.error('Phone verification error:', error);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConfirming(true);

    try {
      await confirmCode(verificationId, verificationCode);
      
      // Check if user is onboarded
      if (user && user.isOnboarded) {
        // If user is already onboarded, redirect to home
        router.push('/');
      } else {
        // If user is new or not onboarded, redirect to onboarding flow
        router.push('/onboarding');
      }
    } catch (error) {
      setError('Could not verify code. Please check the verification code and try again.');
      console.error('Code verification error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // If still checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 relative">
            {/* Replace with your app logo */}
            <div className="w-full h-full flex items-center justify-center bg-primary rounded-full">
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to Collective</h1>
          <p className="text-white/70 mt-2">
            {verificationId 
              ? 'Enter the verification code sent to your phone' 
              : 'Sign in or sign up with your phone number'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-md">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {!verificationId ? (
          // Phone number form
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="mt-1 text-xs text-white/60">
                Include country code, e.g., +1 for US numbers
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !phoneNumber.trim()}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          // Verification code form
          <form onSubmit={handleConfirmCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-white/80 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setVerificationId(null)}
                className="py-2 px-4 border border-gray-700 text-white/80 rounded-md hover:bg-gray-700/50"
                disabled={isConfirming}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isConfirming || verificationCode.length < 6}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirming ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 