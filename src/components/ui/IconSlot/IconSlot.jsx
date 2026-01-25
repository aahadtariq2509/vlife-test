import React from 'react';
import { cn } from '@/lib/utils';

const IconSlot = React.forwardRef(({ 
  icon, 
  position = 'start', 
  size = 'md', 
  className = '', 
  ariaLabel,
  ...props 
}, ref) => {
  if (!icon) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const positionClasses = {
    start: 'mr-2',
    end: 'ml-2',
    top: 'mb-1',
    bottom: 'mt-1',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0',
        sizeClasses[size],
        positionClasses[position],
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </span>
  );
});

IconSlot.displayName = 'IconSlot';

export default IconSlot;
