import React from 'react';
import './styles/Loader.css';

interface LoaderProps {
    size?: 'small' | 'large';
    type?: 'spinner' | 'dots';
    overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
    size = 'small',
    type = 'spinner',
    overlay = false,
}) => {
    if (overlay) {
        return (
            <div className="loader-overlay">
                <div className={`loader loader-${size}`}></div>
            </div>
        );
    }

    if (type === 'dots') {
        return (
            <div className="loader-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        );
    }

    return <div className={`loader loader-${size}`}></div>;
};

export default Loader;