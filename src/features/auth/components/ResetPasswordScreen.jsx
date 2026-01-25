'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuthWelcomeSection from './AuthWelcomeSection';

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { success, error } = useToastContext();
  const { resetPassword, isLoading, resetToken } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        error('Password Mismatch', 'Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        error('Weak Password', 'Password must be at least 6 characters long');
        return;
      }

      if (!resetToken) {
        error('Invalid Session', 'Reset session expired. Please request a new reset code.');
        router.push('/forgot-password');
        return;
      }

      const result = await resetPassword(formData.password);
      
      if (result.success) {
        success('Password Reset Successful', 'Your password has been updated successfully. Please login with your new password.');
        // Redirect to login after successful password reset
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        error('Reset Error', result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      error('Reset Error', err.message || 'Something went wrong. Please try again.');
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

      {/* Left Side - Reset Password Form */}
      <div className="auth-form-container flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96">

          {/* Reset Password Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Reset your Password
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
              Enter your new password to recover your Account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Password Field */}
              <div>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  leftIcon={<Lock className="w-5 h-5" />}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  leftIcon={<Lock className="w-5 h-5" />}
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
        showLoggedOutBanner={false}
        paginationDots={[true, true, true, false]}
      />
    </div>
  );
};

export default ResetPasswordScreen;
