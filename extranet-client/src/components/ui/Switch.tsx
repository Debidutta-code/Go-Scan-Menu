import React from 'react';
import './Switch.css';

interface SwitchProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
    id?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, id }) => {
    return (
        <div
            className="switch-container"
            onClick={onChange}
            data-testid={id}
        >
            <div className={`switch-track ${checked ? 'checked' : ''}`}>
                <div className="switch-thumb" />
            </div>
            {label && <span className="switch-label">{label}</span>}
        </div>
    );
};
