import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    return (
        <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <Link to="/staff/dashboard" className="breadcrumb-link icon-link">
                        <Home size={14} />
                    </Link>
                    <ChevronRight size={14} className="breadcrumb-separator" />
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
                            {item.to && !isLast ? (
                                <Link to={item.to} className="breadcrumb-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="breadcrumb-text">{item.label}</span>
                            )}
                            {!isLast && (
                                <ChevronRight size={14} className="breadcrumb-separator" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
