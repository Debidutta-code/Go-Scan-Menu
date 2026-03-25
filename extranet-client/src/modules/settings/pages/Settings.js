import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { User, Calendar, Settings as SettingsIcon, Clock, Layers, HelpCircle } from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import SettingsLayout from './components/SettingsLayout';
import SettingsEmptyState from './components/SettingsEmptyState';
import AccountSection from './sections/account/AccountSection';
import PreferencesSection from './sections/preferences/PreferencesSection';
import HelpCenterSection from './sections/help-center/HelpCenterSection';
import './Settings.css';
export const Settings = () => {
    const { token, staff } = useStaffAuth();
    const [activeCategory, setActiveCategory] = useState('Account'); // Set Account as default for user request
    const categories = [
        { id: 'Account', icon: _jsx(User, { size: 18 }), label: 'Account' },
        { id: 'Calendars', icon: _jsx(Calendar, { size: 18 }), label: 'Calendars' },
        { id: 'Preferences', icon: _jsx(SettingsIcon, { size: 18 }), label: 'Preferences' },
        { id: 'Schedules', icon: _jsx(Clock, { size: 18 }), label: 'Schedules', badge: 'NEW' },
        { id: 'Integrations', icon: _jsx(Layers, { size: 18 }), label: 'Integrations' },
        { id: 'HelpCenter', icon: _jsx(HelpCircle, { size: 18 }), label: 'Help Center' },
    ];
    const renderContent = () => {
        switch (activeCategory) {
            case 'Account':
                return _jsx(AccountSection, { staff: staff, token: token });
            case 'Preferences':
                return _jsx(PreferencesSection, {});
            case 'HelpCenter':
                return _jsx(HelpCenterSection, {});
            default:
                const activeCatData = categories.find(c => c.id === activeCategory);
                return (_jsx(SettingsEmptyState, { title: activeCategory, icon: activeCatData?.icon || _jsx(SettingsIcon, { size: 18 }) }));
        }
    };
    return (_jsx(SettingsLayout, { activeCategory: activeCategory, onCategoryChange: setActiveCategory, categories: categories, children: renderContent() }));
};
