import React, {
  forwardRef,
  InputHTMLAttributes,
  useId,
  useState,
} from 'react';
import './InputField.css';
import { Eye, EyeOff } from 'lucide-react';

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
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const effectiveType =
      isPassword && showPassword ? 'text' : type;

    return (
      <div
        className={`input-field-wrapper ${fullWidth ? 'full-width' : ''
          } ${className}`}
      >
        <div className="input-field-container">
          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            className={`input-field peer ${error ? 'has-error' : ''
              }`}
            placeholder=" "
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {label && (
            <label
              htmlFor={inputId}
              className="input-field-floating-label"
            >
              {label}
            </label>
          )}

          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          )}
        </div>

        {error && (
          <span
            id={`${inputId}-error`}
            className="input-field-error"
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
