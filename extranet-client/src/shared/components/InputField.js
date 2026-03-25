import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useId, useState } from 'react';
import './InputField.css';
import { Eye, EyeOff } from 'lucide-react';
export const InputField = forwardRef(({ label, error, id, className = '', fullWidth = true, type = 'text', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword && showPassword ? 'text' : type;
    return (_jsxs("div", { className: `input-field-wrapper ${fullWidth ? 'full-width' : ''} ${className}`, children: [_jsxs("div", { className: "input-field-container", children: [_jsx("input", { id: inputId, ref: ref, type: effectiveType, className: `input-field peer ${error ? 'has-error' : ''}`, placeholder: " ", "aria-invalid": !!error, "aria-describedby": error ? `${inputId}-error` : undefined, ...props }), label && (_jsx("label", { htmlFor: inputId, className: "input-field-floating-label", children: label })), isPassword && (_jsx("button", { type: "button", className: "password-toggle", onClick: () => setShowPassword((v) => !v), tabIndex: -1, "aria-label": showPassword ? 'Hide password' : 'Show password', children: showPassword ? _jsx(EyeOff, { size: 18 }) : _jsx(Eye, { size: 18 }) }))] }), error && (_jsx("span", { id: `${inputId}-error`, className: "input-field-error", role: "alert", children: error }))] }));
});
InputField.displayName = 'InputField';
