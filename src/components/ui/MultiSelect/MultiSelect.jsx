import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconSlot } from '../IconSlot';

const MultiSelect = ({
  values = [],
  onChange,
  options = [],
  searchable = true,
  placeholder = 'Select options',
  disabled = false,
  errorText,
  helpText,
  className = '',
  ...props
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const handleRemove = (valueToRemove) => {
    const newValues = values.filter(value => value.value !== valueToRemove.value);
    onChange(newValues);
  };

  const handleSelect = (option) => {
    const isSelected = values.some(value => value.value === option.value);
    if (isSelected) {
      handleRemove(option);
    } else {
      onChange([...values, option]);
    }
    setQuery('');
    setIsOpen(false);
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
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex]);
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
      <div className="relative">
        <div className={cn(
          'relative w-full cursor-default rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
          errorText
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400',
          className
        )}>
          {/* Selected chips */}
          {values.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {values.map((value) => (
                <span
                  key={value.value}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md dark:bg-blue-900 dark:text-blue-200"
                >
                  {value.icon && <IconSlot icon={value.icon} size="sm" />}
                  {value.label}
                  <button
                    type="button"
                    onClick={() => handleRemove(value)}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none"
                    aria-label={`Remove ${value.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          {searchable && (
            <input
              ref={inputRef}
              className="w-full border-none py-0 pl-0 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none dark:text-gray-100 dark:bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={values.length === 0 ? placeholder : ''}
              disabled={disabled}
            />
          )}

          {/* Trigger button */}
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <ChevronDown className={cn(
              "h-5 w-5 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )} aria-hidden="true" />
          </button>
        </div>

        {/* Options dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = values.some(value => value.value === option.value);
                const isFocused = index === focusedIndex;
                return (
                  <div
                    key={option.value || index}
                    className={cn(
                      'relative cursor-default select-none py-2 pl-10 pr-4',
                      isFocused ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
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
              })
            )}
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

export default MultiSelect;
