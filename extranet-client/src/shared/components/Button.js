import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import './Button.css';
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled, className = '', children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (_jsx("button", { ref: ref, type: "button", className: `
          btn
          btn-${variant}
          btn-${size}
          ${fullWidth ? 'full-width' : ''}
          ${loading ? 'loading' : ''}
          ${className}
        `.trim(), disabled: isDisabled, ...props, children: loading ? 'Signing in...' : children }));
});
Button.displayName = 'Button';
