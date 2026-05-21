import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconPlacement?: 'left' | 'right';
  rounded?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      rightIcon,
      iconPlacement = 'left',
      rounded = false,
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
          ${rounded ? 'btn-rounded' : ''}
          ${className}
        `.trim()}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span className="btn-loading-content">Loading...</span>
        ) : (
          <>
            {icon && iconPlacement === 'left' && (
              <span className="btn-icon btn-icon-left">{icon}</span>
            )}
            <span className="btn-text">{children}</span>
            {icon && iconPlacement === 'right' && (
              <span className="btn-icon btn-icon-right">{icon}</span>
            )}
            {rightIcon && (
              <span className="btn-icon btn-icon-right-extra">{rightIcon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
