import React from 'react';

interface SettingsEmptyStateProps {
    icon: React.ReactNode;
    title: string;
}

const SettingsEmptyState: React.FC<SettingsEmptyStateProps> = ({ icon, title }) => {
    return (
        <div className="settings-empty-state">
            <div className="empty-state-icon">
                {icon}
            </div>
            <h3 className="empty-state-title">{title} Settings</h3>
            <p className="empty-state-text">This section is coming soon. Stay tuned!</p>
        </div>
    );
};

export default SettingsEmptyState;
