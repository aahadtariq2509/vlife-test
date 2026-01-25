import React from 'react';
import { Card } from '@/components/ui/Card';

const FitnessSettingsCard = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  parameters = [], 
  children 
}) => {
  return (
    <div className={`transition-all duration-200 bg-[#F3F3F3] border-[2px] rounded-[15px] w-full ${
      isExpanded 
        ? 'border-[#5292E5]' 
        : 'border-[#F3F3F3]'
    }`}>
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-6 text-left flex items-center justify-between rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isExpanded ? 'bg-[#3B84E3]' : 'bg-[#3B84E3]'
          }`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-base sm:text-[17px] font-medium truncate ${
              isExpanded ? 'text-[#4D4D4D]' : 'text-[#4D4D4D]'
            }`}>
              {title}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center">
          {isExpanded ? (
            <svg className="w-5 h-5 text-[#4D4D4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#4D4D4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 sm:ml-[52px] ml-[38px]">
          <div>
            {parameters.length > 0 && parameters[0] && typeof parameters[0] !== 'object' && (
              <ul className="space-y-2 ">
                {parameters.map((param, index) => (
                  <li key={index} className="flex items-center text-sm text-blue-800">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    {param}
                  </li>
                ))}
              </ul>
            )}
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessSettingsCard;
