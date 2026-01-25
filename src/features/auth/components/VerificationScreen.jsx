'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuthWelcomeSection from './AuthWelcomeSection';

const VerificationScreen = () => {
  const router = useRouter();
  const { success, error } = useToastContext();
  const { verifyOTP, resendOTP, pendingVerification, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Debug logging
  console.log('VerificationScreen: Auth state:', {
    isAuthenticated,
    pendingVerification,
    authLoading
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const inputRefs = useRef([]);

  // Redirect logic: Handle all verification flows correctly
  useEffect(() => {
    // Don't run redirect logic if verification was just completed
    if (verificationCompleted) {
      console.log('VerificationScreen: Verification completed, skipping redirect check');
      return;
    }

    console.log('VerificationScreen: Current state:', {
      pendingVerification,
      isAuthenticated,
      isLoading: authLoading,
      verificationCompleted
    });

    // If still loading, don't do anything
    if (authLoading) {
      return;
    }

    // CRITICAL: Check if pendingVerification exists with proper null/undefined checks
    // This handles: forgot-password, login, and registration flows
    // Check for truthy value AND has actual content (email or type)
    const hasPendingVerification = !!pendingVerification &&
                                   (pendingVerification.email || pendingVerification.type);

    console.log('VerificationScreen: Detailed check:', {
      pendingVerification,
      pendingVerificationNotNull: pendingVerification !== null,
      pendingVerificationNotUndefined: pendingVerification !== undefined,
      hasEmail: !!pendingVerification?.email,
      hasType: !!pendingVerification?.type,
      hasPendingVerification,
      type: pendingVerification?.type
    });

    if (hasPendingVerification) {
      const verificationType = pendingVerification.type || 'unknown';
      console.log(`VerificationScreen: ${verificationType} flow detected, staying on screen`);
      return;
    }

    // Only redirect if there's no pending verification AND verification wasn't just completed
    // This means user shouldn't be on verification screen
    // Add a small delay to prevent race conditions where pendingVerification clears before isAuthenticated updates
    const redirectTimer = setTimeout(() => {
      if (verificationCompleted) {
        console.log('VerificationScreen: Verification completed during timeout, skipping redirect');
        return;
      }

      if (isAuthenticated) {
        // User is authenticated but no pending verification - redirect to dashboards
        console.log('VerificationScreen: No pending verification, redirecting to dashboard');
        router.replace('/dashboards');
      } else {
        // User is not authenticated and no pending verification - redirect to login
        console.log('VerificationScreen: No pending verification, redirecting to login');
        router.replace('/login');
      }
    }, 200);

    return () => clearTimeout(redirectTimer);
  }, [pendingVerification, isAuthenticated, authLoading, router, verificationCompleted]);

  // Get masked email for display
  const getMaskedEmail = () => {
    if (!pendingVerification?.email) return 'your email';
    
    const email = pendingVerification.email;
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '****' + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  useEffect(() => {
    // Start resend cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Only allow single character
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    
    // Fill all boxes with pasted data
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    
    setVerificationCode(newCode);
    
    // Focus the last filled input or the last input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      error('Incomplete Code', 'Please enter all 6 digits');
      return;
    }

    console.log('VerificationScreen: Starting OTP verification with code:', code);
    console.log('VerificationScreen: Pending verification:', pendingVerification);
    
    // Capture verification type BEFORE verification (it gets cleared after)
    const verificationType = pendingVerification?.type || 'login';
    console.log('VerificationScreen: Verification type:', verificationType);
    
    setIsLoading(true);

    try {
      const result = await verifyOTP(code);
      console.log('VerificationScreen: OTP verification successful:', result);
      
      // Mark verification as completed to prevent redirect useEffect from running
      setVerificationCompleted(true);
      
      // Use the captured verification type for redirect decision
      if (verificationType === 'forgot-password') {
        // For forgot-password flow, redirect to reset password screen
        success('OTP Verified', 'Please set your new password');
        // Redirect immediately without showing loading screen
        router.push('/reset-password');
      } else {
        // For login/registration flow, redirect to dashboards
        success('Verification Successful', 'Your account has been verified!');
        // Redirect immediately without showing loading screen
        router.push('/dashboards');
      }
    } catch (err) {
      console.error('VerificationScreen: OTP verification failed:', err);
      error('Verification Failed', err.message || 'Invalid verification code. Please try again.');
      // Clear the code on error
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    try {
      // Pass the type from pendingVerification or default to 'login'
      const otpType = pendingVerification?.type || 'login';
      await resendOTP(otpType);
      setResendCooldown(60); // 60 seconds cooldown
      success('Code Sent', 'A new verification code has been sent to your email');
    } catch (err) {
      error('Resend Failed', err.message || 'Failed to resend code. Please try again.');
    }
  };

  // Removed loading screen check - let Next.js handle the transition smoothly

  return (
    <div className="auth-screen-container flex relative">
      {/* Back Arrow Icon - Fixed at top */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-10 w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-full h-full" />
      </button>

      {/* Left Side - Verification Form */}
      <div className="auth-form-container flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96">

          {/* Verification Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Verification Code
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
              We have sent verification code to your email {getMaskedEmail()}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Verification Code Input */}
              <div className="flex justify-center space-x-3 mb-6">
                {verificationCode.map((digit, index) => (
                  <div key={index} className="relative">
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm relative z-10"
                      style={{
                        width: '56px',
                        height: '56px',
                        fontSize: '18px',
                        fontWeight: '600',
                        border: '2px solid #d1d5db',
                        borderRadius: '12px',
                        backgroundColor: '#f9fafb',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    {!digit && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                        style={{
                          width: '56px',
                          height: '56px',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#9ca3af'
                        }}
                      >
                        _
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't get Any code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </p>
              </div>

              {/* Confirm Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading || authLoading}
              >
                Confirm
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <AuthWelcomeSection 
        classNamediv={'rounded-[20px] max-h-[901px] w-full lg:block hidden'}
        className={'hidden'}
        showLoggedOutBanner={false}
        paginationDots={[true, true, false, false, false]}
      />
    </div>
  );
};

export default VerificationScreen;
