import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        className={`
          btn
          btn-${variant}
          btn-${size}
          ${fullWidth ? 'full-width' : ''}
          ${loading ? 'loading' : ''}
          ${className}
        `.trim()}
        disabled={isDisabled}
        {...props}
      >
        {loading ? 'Signing in...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
