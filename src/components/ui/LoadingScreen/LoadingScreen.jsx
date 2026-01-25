import React from 'react';
import Image from 'next/image';

const LoadingScreen = ({ message = '', className = '' }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-gray-50 z-50 ${className}`}>
      <div className="text-center">
        {/* Animated Logo with heartbeat effect */}
        <div className="flex justify-center">
          <div className="animate-heartbeat">
            <Image
              src="/images/logos/logo.png"
              alt="VLW Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

