// src/components/ui/Button.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizeClasses[size]} ${
            children ? 'mr-2' : ''
          }`}></div>
          {children && <span>Chargement...</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconSizeClasses[size]} ${children ? 'mr-2' : ''}`} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconSizeClasses[size]} ${children ? 'ml-2' : ''}`} />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
export { Button };
