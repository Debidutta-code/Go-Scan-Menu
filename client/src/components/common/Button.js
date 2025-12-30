import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import './styles/Button.css';
export const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled = false, icon, iconPosition = 'left', className = '', type = 'button', ...props }) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full-width',
        loading && 'btn-loading',
        disabled && 'btn-disabled',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsx("button", { type: type, className: buttonClasses, disabled: disabled || loading, ...props, children: loading ? (_jsx("span", { className: "btn-spinner" })) : (_jsxs(_Fragment, { children: [icon && iconPosition === 'left' && (_jsx("span", { className: "btn-icon btn-icon-left", children: icon })), children && _jsx("span", { className: "btn-text", children: children }), icon && iconPosition === 'right' && (_jsx("span", { className: "btn-icon btn-icon-right", children: icon }))] })) }));
};
