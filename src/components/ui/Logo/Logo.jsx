import React from 'react';
import { cn } from '@/lib/utils';

const Logo = ({ 
  className,
  size = 'default',
  showText = true,
  ...props 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    default: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <div className={cn('flex items-center', className)} {...props}>
      <div className={cn('relative', sizes[size])}>
        {/* Blue arc/swirl background */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 4C35.0457 4 44 12.9543 44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4Z"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M24 8C32.8366 8 40 15.1634 40 24C40 32.8366 32.8366 40 24 40C15.1634 40 8 32.8366 8 24C8 15.1634 15.1634 8 24 8Z"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M24 12C29.5228 12 34 16.4772 34 22C34 27.5228 29.5228 32 24 32C18.4772 32 14 27.5228 14 22C14 16.4772 18.4772 12 24 12Z"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        
        {/* VLW Text */}
        {showText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg leading-none">
              VLW
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
