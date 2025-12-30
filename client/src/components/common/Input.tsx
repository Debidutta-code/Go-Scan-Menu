// src/components/common/Input.tsx

import React, { forwardRef } from 'react';
import './styles/Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      disabled = false,
      required = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const wrapperClasses = [
      'input-wrapper',
      fullWidth && 'input-wrapper-full',
      disabled && 'input-wrapper-disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      'input',
      hasError && 'input-error',
      icon && iconPosition === 'left' && 'input-with-icon-left',
      icon && iconPosition === 'right' && 'input-with-icon-right',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}

        <div className="input-container">
          {icon && iconPosition === 'left' && (
            <span className="input-icon input-icon-left">{icon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <span className="input-icon input-icon-right">{icon}</span>
          )}
        </div>

        {error && (
          <span id={`${inputId}-error`} className="input-message input-error-message">
            {error}
          </span>
        )}

        {!error && helperText && (
          <span id={`${inputId}-helper`} className="input-message input-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';