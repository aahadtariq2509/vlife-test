'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuthWelcomeSection from './AuthWelcomeSection';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { success, error } = useToastContext();
  const { forgotPassword, isLoading, pendingVerification } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!email) {
        error('Email Required', 'Please enter your email address');
        return;
      }

      const result = await forgotPassword(email);
      
      if (result.success) {
        success('Reset Code Sent', 'Please check your email for password reset code');
        
        // Wait a moment for Redux state to update with pendingVerification
        // Then redirect to verify screen
        setTimeout(() => {
          router.push('/verify');
        }, 100);
      } else {
        error('Reset Error', result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Something went wrong. Please try again.';
      error('Reset Error', errorMessage);
    }
  };

  return (
    <div className="auth-screen-container flex relative">
      {/* Back Arrow Icon - Fixed at top */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-10 w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-full h-full" />
      </button>

      {/* Left Side - Forgot Password Form */}
      <div className="auth-form-container flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96">

          {/* Forgot Password Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
              Enter your email to recover your password
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email Field */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@gmail.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <AuthWelcomeSection 
        classNamediv={'rounded-[20px] max-h-[901px] w-full lg:block hidden'}
        className={'hidden'}
        showLoggedOutBanner={true}
        paginationDots={[true, false, false]}
      />
    </div>
  );
};

export default ForgotPasswordScreen;
