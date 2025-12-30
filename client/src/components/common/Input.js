import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/common/Input.tsx
import { forwardRef } from 'react';
import './styles/Input.css';
export const Input = forwardRef(({ label, error, helperText, icon, iconPosition = 'left', fullWidth = false, className = '', disabled = false, required = false, id, ...props }, ref) => {
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
    return (_jsxs("div", { className: wrapperClasses, children: [label && (_jsxs("label", { htmlFor: inputId, className: "input-label", children: [label, required && _jsx("span", { className: "input-required", children: "*" })] })), _jsxs("div", { className: "input-container", children: [icon && iconPosition === 'left' && (_jsx("span", { className: "input-icon input-icon-left", children: icon })), _jsx("input", { ref: ref, id: inputId, className: inputClasses, disabled: disabled, "aria-invalid": hasError, "aria-describedby": error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined, ...props }), icon && iconPosition === 'right' && (_jsx("span", { className: "input-icon input-icon-right", children: icon }))] }), error && (_jsx("span", { id: `${inputId}-error`, className: "input-message input-error-message", children: error })), !error && helperText && (_jsx("span", { id: `${inputId}-helper`, className: "input-message input-helper-text", children: helperText }))] }));
});
Input.displayName = 'Input';
