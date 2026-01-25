'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const AuthNavigation = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Auth Flow Navigation
        </h1>
        
        <div className="space-y-4">
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full">
              Login Screen
            </Button>
          </Link>
          
          <Link href="/register" className="block">
            <Button variant="secondary" className="w-full">
              Registration Screen
            </Button>
          </Link>
          
          <Link href="/verify" className="block">
            <Button variant="secondary" className="w-full">
              Verification Code Screen
            </Button>
          </Link>
          
          <Link href="/forgot-password" className="block">
            <Button variant="secondary" className="w-full">
              Forgot Password Screen
            </Button>
          </Link>
          
          <Link href="/reset-password" className="block">
            <Button variant="secondary" className="w-full">
              Reset Password Screen
            </Button>
          </Link>
          
          <Link href="/password-reset-success" className="block">
            <Button variant="secondary" className="w-full">
              Password Reset Success Screen
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthNavigation;
