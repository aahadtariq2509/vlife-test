'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { formatValue } from '@/lib/dashboard-utils';

// Icon mapping for different attributes
const ICON_MAP = {
  'sleep_management': '/images/icons/sleep.svg',
  'heart_beat': '/images/icons/heart.svg',
  'blood_pressure': '/images/icons/bp.svg',
  // Add more mappings as needed
};

const UnmatchedAttributesCards = ({ unmatchedAttributes }) => {
  if (!unmatchedAttributes || unmatchedAttributes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 gap-3 mb-6">
      {unmatchedAttributes.map((attribute, index) => {
        // Get the latest value - show 0 if no values
        const latestValue = attribute.values?.[0];
        const value = latestValue?.value || '0';
        const unit = attribute.unit || '';
        const displayName = attribute.display_name || attribute.name;

        // Format the value for display - show 0 with unit if no data
        const valueType = attribute.value_type;
        const formattedValue = attribute.values && attribute.values.length > 0
          ? formatValue(value, unit, valueType)
          : `0 ${unit}`;

        // Get icon path from mapping or fallback
        const attributeName = attribute.name;
        const iconPath = ICON_MAP[attributeName] || null;

        return (
          <Card key={index} className={`flex flex-col justify-between bg-white border-[0.5px] h-[153px] border-[#0000001A] rounded-[14.01px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-6 w-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 ${attribute.values && attribute.values.length > 0
            ? 'bg-white dark:bg-gray-800'
            : 'bg-gray-50 dark:bg-gray-700'
            }`}>
            <div className="flex h-full space-x-3">

              <div className="min-w-0 flex-1 flex justify-between flex-col">
                <h3 className={`text-sm font-medium text-[#4D4D4D] mb-1 truncate ${attribute.values && attribute.values.length > 0
                  ? 'text-[#4D4D4D] dark:text-gray-400'
                  : 'text-[#4D4D4D] dark:text-gray-500'
                  }`}>
                  {displayName}
                </h3>
                <p
                  className={`md:text-2xl text-lg text-[#4D4D4D] ${attribute.values && attribute.values.length > 0
                    ? 'text-[#4D4D4D] dark:text-white'
                    : 'text-[#4D4D4D] dark:text-gray-400'
                    }`}
                >
                  <span className="font-bold">{formattedValue.split(' ')[0]}</span>{' '}
                  <span className="font-normal">{formattedValue.split(' ').slice(1).join(' ')}</span>
                </p>
                {/* <p className={`md:text-2xl text-lg font-bold text-[#4D4D4D] ${attribute.values && attribute.values.length > 0
                  ? 'text-[#4D4D4D] dark:text-white'
                  : 'text-[#4D4D4D] dark:text-gray-400'
                  }`}>
                  {formattedValue}
                </p> */}
              </div>
              <div className="flex-shrink-0">
                {iconPath ? (
                  <Image
                    src={iconPath}
                    alt={displayName}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${attribute.values && attribute.values.length > 0
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-gray-200 dark:bg-gray-500'
                    }`}>
                    <span className={`text-xs ${attribute.values && attribute.values.length > 0
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-500 dark:text-gray-500'
                      }`}>
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default UnmatchedAttributesCards;
