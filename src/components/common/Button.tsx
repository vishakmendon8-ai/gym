import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-control gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-btn gap-2',
    lg: 'px-6 py-3.5 text-base rounded-btn gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary: 'btn-jelly-yellow',
    secondary: 'btn-jelly-secondary',
    dark: 'btn-jelly-dark',
    ghost: 'text-graphite hover:bg-cloud-grey/60 active:opacity-80 transition-all duration-150 rounded-control',
    danger: 'btn-jelly-danger',
  };

  return (
    <button
      disabled={disabled}
      className={`font-sans tracking-tight ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
