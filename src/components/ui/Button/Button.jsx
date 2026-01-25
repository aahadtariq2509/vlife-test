import { cn } from '@/lib/utils';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  className,
  backgroundColor,
  textColor,
  width = 'w-full',
  fullWidth = false,
  ...props 
}) => {
  // Determine width class - prioritize fullWidth, then custom width, then default
  const widthClass = fullWidth ? 'w-full' : width;
  const baseClasses = `inline-flex items-center justify-center font-semibold rounded-[30px] border-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${widthClass} h-[50px]`;
  
  const variants = {
    primary: 'text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 border-gray-200 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    success: 'bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const sizeClass = sizes[size];
  
  // ✅ Updated default color to #4289E6 for primary
  const buttonBgColor = backgroundColor || (variant === 'primary' ? '#4289E6' : '');
  const buttonTextColor = textColor || (variant === 'primary' ? '#FFFFFF' : '');

  // Hover/Active states remain the same
  const handleMouseEnter = (e) => {
    if (variant === 'primary' && !backgroundColor) {
      e.target.style.backgroundColor = '#3B7ED8'; // slightly darker hover
    }
  };

  const handleMouseLeave = (e) => {
    if (variant === 'primary' && !backgroundColor) {
      e.target.style.backgroundColor = '#4289E6';
    }
  };

  const handleMouseDown = (e) => {
    if (variant === 'primary' && !backgroundColor) {
      e.target.style.backgroundColor = '#3673C7'; // darker on click
    }
  };

  const handleMouseUp = (e) => {
    if (variant === 'primary' && !backgroundColor) {
      e.target.style.backgroundColor = '#3B7ED8';
    }
  };

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variants[variant],
        sizeClass,
        className
      )}
      style={{
        backgroundColor: buttonBgColor,
        color: buttonTextColor,
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '100%',
        letterSpacing: '0px',
        textAlign: 'center',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={cn(iconSizes[size], 'mr-2')}>
          {icon}
        </span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={cn(iconSizes[size], 'ml-2')}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
