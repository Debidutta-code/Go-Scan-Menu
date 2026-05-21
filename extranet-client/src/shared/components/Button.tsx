import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: 'left' | 'right';
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
      iconPlacement = 'left',
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = [
      'shared-btn',
      `shared-btn-${variant}`,
      `shared-btn-${size}`,
      fullWidth ? 'shared-btn-full-width' : '',
      loading ? 'shared-btn-loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span className="shared-btn-spinner">Loading…</span>
        ) : (
          <>
            {icon && iconPlacement === 'left' && (
              <span className="shared-btn-icon">{icon}</span>
            )}
            {children}
            {icon && iconPlacement === 'right' && (
              <span className="shared-btn-icon">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
