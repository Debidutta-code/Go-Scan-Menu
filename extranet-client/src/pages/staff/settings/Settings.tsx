import React, { useState } from 'react';
import {
    User,
    Calendar,
    Settings as SettingsIcon,
    Clock,
    Layers
} from 'lucide-react';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import SettingsLayout from './components/SettingsLayout';
import SettingsEmptyState from './components/SettingsEmptyState';
import AccountSection from './sections/account/AccountSection';
import PreferencesSection from './sections/preferences/PreferencesSection';
import './Settings.css';

export const Settings: React.FC = () => {
    const { token, staff } = useStaffAuth();
    const [activeCategory, setActiveCategory] = useState('Account'); // Set Account as default for user request

    const categories = [
        { id: 'Account', icon: <User size={18} />, label: 'Account' },
        { id: 'Calendars', icon: <Calendar size={18} />, label: 'Calendars' },
        { id: 'Preferences', icon: <SettingsIcon size={18} />, label: 'Preferences' },
        { id: 'Schedules', icon: <Clock size={18} />, label: 'Schedules', badge: 'NEW' },
        { id: 'Integrations', icon: <Layers size={18} />, label: 'Integrations' },
    ];

    const renderContent = () => {
        switch (activeCategory) {
            case 'Account':
                return <AccountSection staff={staff} token={token!} />;
            case 'Preferences':
                return <PreferencesSection />;
            default:
                const activeCatData = categories.find(c => c.id === activeCategory);
                return (
                    <SettingsEmptyState
                        title={activeCategory}
                        icon={activeCatData?.icon || <SettingsIcon size={18} />}
                    />
                );
        }
    };

    return (
        <SettingsLayout
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
        >
            {renderContent()}
        </SettingsLayout>
    );
};
