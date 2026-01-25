import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconSlot } from '../IconSlot';

const SingleSelect = ({
  value,
  onChange,
  options = [],
  icon,
  placeholder = 'Select an option',
  disabled = false,
  errorText,
  helpText,
  label,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const selectedOption = options.find(option => option.value === value?.value);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelect(options[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-[13px] font-normal text-[#4D4D4D] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          className={cn(
            'relative w-full cursor-default bg-[#F3F3F3] rounded-full border text-xs text-[#4D4D4D] py-3.5 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            errorText
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400',
            icon ? 'pl-10' : '',
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...props}
        >
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSlot icon={icon} size="md" />
            </div>
          )}

          <span className={cn(
            'block truncate',
            selectedOption ? 'text-[#4D4D4D] dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className={cn(
              "h-5 w-5 text-[#4D4D4D] transition-transform",
              isOpen && "rotate-180"
            )} aria-hidden="true" />
          </span>
        </button>

        {/* Options dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
            {options.map((option, index) => {
              const isSelected = value?.value === option.value;
              const isFocused = index === focusedIndex;
              return (
                <div
                  key={option.value || index}
                  className={cn(
                    'relative cursor-default select-none py-2 pl-10 pr-4',
                    isFocused ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' : 'text-[#4D4D4D] dark:text-gray-100'
                  )}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <span className={cn(
                    'block truncate',
                    isSelected ? 'font-medium' : 'font-normal'
                  )}>
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <IconSlot icon={option.icon} size="sm" />
                      )}
                      {option.label}
                    </div>
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {errorText && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errorText}
        </p>
      )}

      {helpText && !errorText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default SingleSelect;
