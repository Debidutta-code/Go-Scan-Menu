// src/components/ui/InputField.tsx
import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import './InputField.css';
import { Eye, EyeOff } from 'lucide-react'; // ← install: npm install lucide-react

export interface InputFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      id,
      className = '',
      fullWidth = true,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const isPassword = type === 'password';
    const effectiveType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={`input-field-wrapper ${fullWidth ? 'full-width' : ''} ${className} ${error ? 'has-error' : ''}`}>
        <div className="input-field-container">
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            className={`input-field peer ${error ? 'has-error' : ''}`}
            placeholder=" "
            {...props}
          />

          {label && (
            <label htmlFor={inputId} className="input-field-floating-label">
              {label}
            </label>
          )}

          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && (
          <span className="input-field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';