import React from 'react';
import './styles/Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'button';
    const variantClass = `button-${variant}`;
    const sizeClass = size === 'medium' ? '' : `button-${size}`;
    const loadingClass = loading ? 'button-loading' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="loader" style={{ marginRight: 8 }}></span>
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;