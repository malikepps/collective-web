import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { verifyPhoneNumber, confirmCode } = useAuth();
  
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`;
      
      const id = await verifyPhoneNumber(formattedNumber);
      setVerificationId(id);
      setStep(2);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await confirmCode(verificationId, verificationCode);
      // Redirect to home page after successful login
      router.push('/');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 min-h-screen bg-background text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-marfa font-semibold mb-6">
        Welcome to Collective
      </h1>
      
      {/* Invisible recaptcha container */}
      <div id="recaptcha-container"></div>
      
      <div className="w-full max-w-md">
        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="mb-4">
              <label className="block font-marfa text-sm mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded"
                placeholder="+1 (555) 555-5555"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white p-3 rounded font-marfa font-medium"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="mb-4">
              <label className="block font-marfa text-sm mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded"
                placeholder="123456"
                required
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white p-3 rounded font-marfa font-medium"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 bg-transparent text-white p-3 border border-gray-600 rounded font-marfa"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 