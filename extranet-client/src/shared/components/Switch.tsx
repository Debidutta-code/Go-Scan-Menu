import React from 'react';
import './Switch.css';

interface SwitchProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
    id?: string;
    disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, id, disabled }) => {
    return (
        <div
            className={`switch-container ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onChange()}
            data-testid={id}
        >
            <div className={`switch-track ${checked ? 'checked' : ''}`}>
                <div className="switch-thumb" />
            </div>
            {label && <span className="switch-label">{label}</span>}
        </div>
    );
};
