import React from 'react';
import './styles/Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    compact?: boolean;
    noShadow?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    compact = false,
    noShadow = false,
    onClick,
}) => {
    const compactClass = compact ? 'card-compact' : '';
    const shadowClass = noShadow ? 'card-no-shadow' : '';

    return (
        <div
            className={`card ${compactClass} ${shadowClass} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};

export default Card;

// Optional sub-components for better structure
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => <div className={`card-header ${className}`}>{children}</div>;

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => <div className={`card-body ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => <div className={`card-footer ${className}`}>{children}</div>;

export const CardImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <img src={src} alt={alt} className="card-image" />
);