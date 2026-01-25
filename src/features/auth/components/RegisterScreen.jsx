'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuthWelcomeSection from './AuthWelcomeSection';
import { countries, getEmojiFlag } from 'countries-list';

const RegisterScreen = () => {
  const router = useRouter();
  const { success, error } = useToastContext();
  const { register, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  const countryDropdownRef = useRef(null);
  const countrySearchInputRef = useRef(null);

  const sanitizeDialCode = (code) => code.replace(/[^\d]/g, '');

  const countryOptions = useMemo(() => {
    return Object.entries(countries)
      .map(([code, data]) => {
        const primaryPhone = Array.isArray(data.phone) ? data.phone[0] : data.phone;
        const dialSegment = (primaryPhone ?? '').toString().split(',')[0]?.trim() || '';
        const dialCode = sanitizeDialCode(dialSegment);

        if (!dialCode) {
          return null;
        }

        const flag = getEmojiFlag(code);
        const label = `${data.name} (+${dialCode})`;

        return {
          code,
          dialCode,
          label,
          name: data.name,
          flag,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const countryDialCodeMap = useMemo(() => {
    return countryOptions.reduce((acc, option) => {
      acc[option.code] = option.dialCode;
      return acc;
    }, {});
  }, [countryOptions]);

  const defaultCountryCode = useMemo(() => {
    if (!countryOptions.length) {
      return '';
    }

    return countryOptions.find((option) => option.code === 'US')?.code || countryOptions[0].code;
  }, [countryOptions]);

  const [selectedCountryCode, setSelectedCountryCode] = useState(defaultCountryCode);

  const selectedCountry = useMemo(() => {
    return countryOptions.find((option) => option.code === selectedCountryCode);
  }, [selectedCountryCode, countryOptions]);

  const countryDialCodeLookup = useMemo(() => {
    return [...countryOptions].sort((a, b) => b.dialCode.length - a.dialCode.length);
  }, [countryOptions]);

  const getDialCodeForCountry = (countryCode) => {
    if (!countryCode) return '';
    return countryDialCodeMap[countryCode] || '';
  };

  const getCurrentDialCode = () => getDialCodeForCountry(selectedCountryCode);

  const buildInternationalPhoneNumber = (localNumber = formData.phoneNumber, countryCode = selectedCountryCode) => {
    const dialCode = getDialCodeForCountry(countryCode);

    if (!dialCode || !localNumber) {
      return '';
    }

    return `+${dialCode}${localNumber}`;
  };

  const phonePlaceholder = useMemo(() => {
    if (!selectedCountry) {
      return 'Enter phone number';
    }
    return `Enter ${selectedCountry.name} phone number`;
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountryCode && defaultCountryCode) {
      setSelectedCountryCode(defaultCountryCode);
    }
  }, [defaultCountryCode, selectedCountryCode]);

  useEffect(() => {
    const dialCode = getCurrentDialCode();

    if (!dialCode) {
      return;
    }

    const maxLocalLength = Math.max(0, 15 - dialCode.length);

    setFormData((prev) => {
      const trimmedLocal = prev.phoneNumber.replace(/\D/g, '').slice(0, maxLocalLength);

      if (trimmedLocal === prev.phoneNumber) {
        return prev;
      }

      return {
        ...prev,
        phoneNumber: trimmedLocal,
      };
    });
  }, [selectedCountryCode]);

  useEffect(() => {
    if (!isCountryDropdownOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
        setCountrySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  useEffect(() => {
    if (isCountryDropdownOpen && countrySearchInputRef.current) {
      countrySearchInputRef.current.focus();
    }
  }, [isCountryDropdownOpen]);

  const filteredCountryOptions = useMemo(() => {
    const searchTerm = countrySearchTerm.trim().toLowerCase();

    if (!searchTerm) {
      return countryOptions;
    }

    return countryOptions.filter(option => {
      const nameMatch = option.name.toLowerCase().includes(searchTerm);
      const dialMatch = option.dialCode.includes(searchTerm.replace(/^\+/, ''));
      return nameMatch || dialMatch;
    });
  }, [countryOptions, countrySearchTerm]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    return /^\+[1-9]\d{1,14}$/.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password);
  };

  const validateFullName = (name) => {
    return name.trim().length >= 2;
  };

  const validateForm = (showAllErrors = false) => {
    const errors = {};

    // Validate full name
    if (showAllErrors || touchedFields.fullName) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (!validateFullName(formData.fullName)) {
        errors.fullName = 'Full name must be at least 2 characters';
      }
    }

    // Validate email
    if (showAllErrors || touchedFields.email) {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate phone number
    if (showAllErrors || touchedFields.phoneNumber) {
      const internationalPhone = buildInternationalPhoneNumber();

      if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!internationalPhone || !validatePhone(internationalPhone)) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    // Validate password
    if (showAllErrors || touchedFields.password) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (!validatePassword(formData.password)) {
        errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
      }
    }

    // Validate confirm password
    if (showAllErrors || touchedFields.confirmPassword) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    // Validate terms agreement
    if (showAllErrors || touchedFields.terms) {
      if (!agreeToTerms) {
        errors.terms = 'You must agree to the terms and conditions';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      let nextCountryCode = selectedCountryCode;
      let digitsOnly = value.replace(/\D/g, '');

      const trimmed = value.trim();
      if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
        const internationalDigits = trimmed.startsWith('00')
          ? trimmed.replace(/^00/, '').replace(/\D/g, '')
          : trimmed.replace(/\D/g, '');

        const matchedCountry = countryDialCodeLookup.find(option =>
          internationalDigits.startsWith(option.dialCode)
        );

        if (matchedCountry) {
          nextCountryCode = matchedCountry.code;
          digitsOnly = internationalDigits.slice(matchedCountry.dialCode.length);
        }
      }

      const nextDialCode = getDialCodeForCountry(nextCountryCode);
      const maxLocalLength = Math.max(0, 15 - nextDialCode.length);
      const numericValue = digitsOnly.slice(0, maxLocalLength);

      if (nextCountryCode !== selectedCountryCode) {
        setSelectedCountryCode(nextCountryCode);
        setTouchedFields(prev => ({
          ...prev,
          phoneNumber: true
        }));
      }

      setFormData(prev => ({
        ...prev,
        phoneNumber: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleCountrySelect = (newCountryCode) => {
    setSelectedCountryCode(newCountryCode);
    setIsCountryDropdownOpen(false);
    setCountrySearchTerm('');
    setTouchedFields(prev => ({
      ...prev,
      phoneNumber: true
    }));

    if (validationErrors.phoneNumber) {
      setValidationErrors(prev => ({
        ...prev,
        phoneNumber: ''
      }));
    }
  };

  const handleTermsChange = (e) => {
    setAgreeToTerms(e.target.checked);
    setTouchedFields(prev => ({
      ...prev,
      terms: true
    }));
  };

  // Check form validity whenever form data changes
  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData, agreeToTerms, touchedFields, selectedCountryCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched and validate form before submission
    setTouchedFields({
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
      terms: true
    });
    
    if (!validateForm(true)) {
      error('Validation Error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Call the real register API
      const internationalPhone = buildInternationalPhoneNumber();

      const result = await register(
        formData.fullName,
        formData.email,
        internationalPhone,
        formData.password
      );
      
      if (result.requireOTP) {
        success('Registration Successful', 'Please check your email for verification');
        router.push('/verify');
      }
    } catch (err) {
      error('Registration Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    success('Google Registration', 'Redirecting to Google...');
    // Implement Google OAuth here
  };

  return (
    <div className="auth-screen-container flex">
      {/* Left Side - Registration Form */}
      <div className="auth-form-container flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96 py-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logos/logo.png"
              alt="VLW Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>

          {/* Registration Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
              New Registration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              Just a few things to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name Field */}
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Enter your full name"
                  leftIcon={<User className="w-5 h-5" />}
                  error={validationErrors.fullName}
                />
              </div>

              {/* Email Field */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Enter your email address"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={validationErrors.email}
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-[13px] font-normal text-[#4D4D4D] mb-1">
                  Phone Number
                </label>
                <div className="relative" ref={countryDropdownRef}>
                  <div
                    className={`flex items-center w-full h-[50px] rounded-full border border-transparent bg-[var(--color-input-bg)] text-sm transition-all duration-200 ${
                      validationErrors.phoneNumber ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-blue-500'
                    }`}
                    style={{ color: 'var(--color-input-text)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(prev => !prev)}
                      className="h-full px-4 rounded-l-full flex items-center gap-2 focus:outline-none"
                      aria-expanded={isCountryDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      <span className="text-2xl leading-none">
                        {selectedCountry?.flag || '🌐'}
                      </span>
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 8L10 12L14 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="sr-only">
                        {selectedCountry ? selectedCountry.label : 'Select country'}
                      </span>
                    </button>
                    <span className="h-full px-3 border-l border-gray-200 dark:border-gray-700 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                      +{getCurrentDialCode()}
                    </span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder={phonePlaceholder}
                      className="flex-1 h-full bg-transparent border-0 px-4 text-sm focus:outline-none rounded-r-full placeholder:text-[var(--color-input-placeholder)]"
                      inputMode="tel"
                    />
                  </div>
                  <div className="mt-1 h-5">
                    {validationErrors.phoneNumber && (
                      <p className="text-sm text-red-600">
                        {validationErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {isCountryDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <input
                          ref={countrySearchInputRef}
                          type="text"
                          value={countrySearchTerm}
                          onChange={(event) => setCountrySearchTerm(event.target.value)}
                          placeholder="Search country"
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto py-2">
                        {filteredCountryOptions.length > 0 ? (
                          filteredCountryOptions.map(option => (
                            <button
                              type="button"
                              key={option.code}
                              onClick={() => handleCountrySelect(option.code)}
                              className={`w-full px-4 py-2 text-sm text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                                option.code === selectedCountryCode ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                              }`}
                            >
                              <span className="text-xl">{option.flag}</span>
                              <span>{option.label}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No countries found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={validationErrors.password}
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
                  onBlur={handleInputBlur}
                  placeholder="Confirm your password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={validationErrors.confirmPassword}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={handleTermsChange}
                    className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200 ${
                      validationErrors.terms ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                    I Agree with the{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/conditions" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                      Conditions
                    </Link>
                  </label>
                  <div className="mt-1 h-5">
                    {validationErrors.terms && (
                      <p className="text-sm text-red-600 transition-opacity duration-200">
                        {validationErrors.terms}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading || authLoading}
                disabled={!isFormValid || isLoading || authLoading}
              >
                Register
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    or
                  </span>
                </div>
              </div>

              {/* Google Register Button */}
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleGoogleRegister}
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
                iconPosition="left"
              >
                Continue with Google
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an Account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <AuthWelcomeSection 
        classNamediv={'rounded-[20px] max-h-[901px] w-full lg:block hidden'}
        className={'hidden'}
        showLoggedOutBanner={false}
        paginationDots={[true, false, false, false]}
      />
    </div>
  );
};

export default RegisterScreen;

