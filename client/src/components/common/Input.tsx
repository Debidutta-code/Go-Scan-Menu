import React from 'react';
import './styles/Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        const hasError = !!error;

        return (
            <div className="input-group">
                {label && <label className="input-label">{label}</label>}
                <input
                    ref={ref}
                    className={`input ${hasError ? 'input-error' : ''} ${className}`}
                    aria-invalid={hasError}
                    {...props}
                />
                {(error || helperText) && (
                    <span className={`input-helper-text ${hasError ? 'input-error-text' : ''}`}>
                        {error || helperText}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;