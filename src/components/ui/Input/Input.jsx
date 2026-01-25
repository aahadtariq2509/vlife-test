import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({ 
  className, 
  type = 'text', 
  label, 
  error, 
  helpText, 
  leftIcon,
  rightIcon,
  variant = 'default',
  width = 'w-full',
  fullWidth = true,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Base classes with responsive design: full width by default, height 50px, border-radius 30px
  const widthClass = fullWidth ? 'w-full' : width;
  const baseClasses = `  ${widthClass} h-[50px] rounded-full border-0 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200`;
  
  const variants = {
    default: 'text-gray-900',
    filled: 'text-gray-900',
    outlined: 'bg-transparent border-2 border-gray-300',
  };

  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  
  // Calculate padding based on which icons are present
  const getPaddingClasses = () => {
    let paddingClasses = '';
    if (leftIcon) {
      paddingClasses += 'pl-12';
    } else {
      paddingClasses += 'pl-4';
    }
    if (rightIcon || isPassword) {
      paddingClasses += ' pr-12';
    } else {
      paddingClasses += ' pr-4';
    }
    return paddingClasses.trim();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const PasswordToggleIcon = showPassword ? EyeOff : Eye;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-normal text-[#4D4D4D] mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-lg" style={{ color: 'var(--color-input-icon)' }}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          type={actualType}
          className={cn(
            baseClasses,
            variants[variant],
            getPaddingClasses(),
            error && 'focus:ring-red-500 border-red-300',
            className
          )}
          style={{
            backgroundColor: 'var(--color-input-bg)',
            color: 'var(--color-input-text)',
            '--tw-placeholder-color': 'var(--color-input-placeholder)',
          }}
          ref={ref}
          {...props}
        />
        
        {isPassword && !rightIcon && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 focus:outline-none focus:text-gray-600"
            style={{ color: 'var(--color-input-icon)' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <PasswordToggleIcon className="w-5 h-5" />
          </button>
        )}
        
        {isPassword && rightIcon && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 focus:outline-none focus:text-gray-600"
            style={{ color: 'var(--color-input-icon)' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <span className="text-lg">
              {rightIcon}
            </span>
          </button>
        )}
        
        {rightIcon && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-lg" style={{ color: 'var(--color-input-icon)' }}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {/* Always reserve space for error/help text to prevent layout shift */}
      <div className="mt-1 h-5">
        {error && (
          <p className="text-sm text-red-600 transition-opacity duration-200">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p className="text-sm text-gray-500 transition-opacity duration-200">
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
