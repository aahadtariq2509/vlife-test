import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { IconSlot } from '../IconSlot';

const TextArea = forwardRef(({
  value,
  onChange,
  icon,
  placeholder,
  rows = 4,
  maxLength,
  disabled = false,
  errorText,
  helpText,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-vertical';
  
  const stateClasses = errorText
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400';

  const iconPaddingClasses = icon ? 'pl-10' : '';

  const characterCount = value ? String(value).length : 0;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            <IconSlot icon={icon} size="md" />
          </div>
        )}
        
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            baseClasses,
            stateClasses,
            iconPaddingClasses,
            className
          )}
          {...props}
        />
      </div>

      <div className="flex justify-between items-center mt-1">
        {errorText && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorText}
          </p>
        )}

        {helpText && !errorText && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}

        {maxLength && (
          <p className={cn(
            'text-sm ml-auto',
            isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          )}>
            {characterCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
