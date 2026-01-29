import React, { ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  icon: Icon, 
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};
