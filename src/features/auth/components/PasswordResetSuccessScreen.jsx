'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AuthWelcomeSection from './AuthWelcomeSection';

const PasswordResetSuccessScreen = () => {
  const router = useRouter();

  const handleLoginNow = () => {
    router.push('/login');
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

      {/* Left Side - Success Message */}
      <div className="auth-form-container flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Success Content */}
          <div className="text-center">
            {/* Tada Icon */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/illustrations/tada.png"
                alt="Success celebration"
                width={80}
                height={80}
                className="w-20 h-20"
              />
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              You can now login to application with your new password.
            </p>

            {/* Login Button */}
            <Button
              onClick={handleLoginNow}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Login Now
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <AuthWelcomeSection 
        classNamediv={'rounded-[20px] max-h-[901px] w-full lg:block hidden'}
        className={'hidden'}
        showLoggedOutBanner={false}
        paginationDots={[true, true, true, true, false]}
      />
    </div>
  );
};

export default PasswordResetSuccessScreen;
