import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formattedNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+1${phoneNumber}`;
      
      // Initialize reCAPTCHA verifier
      const auth = getAuth();
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA resolved');
        }
      });
      
      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setStep(2);
      
      // Clean up reCAPTCHA
      recaptchaVerifier.clear();
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
      // Create credential
      const auth = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        // Update last login
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          last_login: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        
        // Store user data in localStorage
        localStorage.setItem('auth_user', JSON.stringify({
          uid: userCredential.user.uid,
          displayName: userDoc.data().display_name || '',
          phoneNumber: userCredential.user.phoneNumber || '',
          isOnboarded: userDoc.data().is_onboarded || false,
          photoURL: userDoc.data().profile_image_url || null,
          firstName: userDoc.data().first_name || '',
          lastName: userDoc.data().last_name || '',
        }));
        
        // Redirect to home page after successful login
        router.push('/');
      } else {
        // New user - redirect to onboarding
        router.push('/onboarding');
      }
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