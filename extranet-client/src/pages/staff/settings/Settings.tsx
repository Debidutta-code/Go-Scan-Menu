import React, { useState } from 'react';
import {
    User,
    Calendar,
    Settings as SettingsIcon,
    Clock,
    Layers,
    HelpCircle,
    Sun,
    CloudSun,
    CloudRain,
    Moon
} from 'lucide-react';
import './Settings.css';

interface CategoryItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: string;
    onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ icon, label, active, badge, onClick }) => (
    <div className={`settings-cat-item ${active ? 'active' : ''}`} onClick={onClick}>
        <div className="cat-icon">{icon}</div>
        <span className="cat-label">{label}</span>
        {badge && <span className="cat-badge">{badge}</span>}
    </div>
);

export const Settings: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('Preferences');
    const [timePreference, setTimePreference] = useState('Mid-Day');

    const categories = [
        { id: 'Account', icon: <User size={18} />, label: 'Account' },
        { id: 'Calendars', icon: <Calendar size={18} />, label: 'Calendars' },
        { id: 'Preferences', icon: <SettingsIcon size={18} />, label: 'Preferences' },
        { id: 'Schedules', icon: <Clock size={18} />, label: 'Schedules', badge: 'NEW' },
        { id: 'Integrations', icon: <Layers size={18} />, label: 'Integrations' },
    ];

    return (
        <div className="settings-page-layout">
            {/* Page Actions Toolbar - Matching Dashboard/Category pattern */}
            <div className="settings-page-toolbar">
                <div className="toolbar-left">
                    <h1 className="settings-page-title">Settings</h1>
                    <p className="toolbar-subtitle">Manage your account and app preferences</p>
                </div>
                <div className="settings-toolbar-actions">
                    <span className="status-badge active">Changes Saved</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="settings-page-content">
                <div className="settings-grid">
                    {/* Left Panel - Category Bar */}
                    <div className="settings-sidebar-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Categories</h2>
                        </div>
                        <div className="panel-content">
                            <div className="settings-cat-list">
                                {categories.map(cat => (
                                    <CategoryItem
                                        key={cat.id}
                                        icon={cat.icon}
                                        label={cat.label}
                                        active={activeCategory === cat.id}
                                        badge={cat.badge}
                                        onClick={() => setActiveCategory(cat.id)}
                                    />
                                ))}
                            </div>
                            <div className="settings-cat-footer">
                                <CategoryItem
                                    icon={<HelpCircle size={18} />}
                                    label="Help Center"
                                    onClick={() => { }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Settings Content */}
                    <div className="settings-main-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">{activeCategory}</h2>
                        </div>
                        <div className="panel-content">
                            {/* Notice Banner */}
                            <div className="settings-notice-banner">
                                <div className="notice-icon">
                                    <Calendar size={18} />
                                </div>
                                <div className="notice-text">
                                    <span className="notice-label">Notice:</span>
                                    Availability settings have moved to schedules
                                </div>
                                <button className="notice-action-btn">
                                    Go to Schedules
                                </button>
                            </div>

                            <div className="settings-section">
                                <h3 className="section-title">Event Preferences</h3>

                                <div className="settings-form-group">
                                    <label className="form-label">What are your normal working hours?</label>
                                    <div className="time-picker-row">
                                        <div className="select-container">
                                            <select className="settings-select">
                                                <option>9:00 AM</option>
                                            </select>
                                        </div>
                                        <span className="time-separator">TO</span>
                                        <div className="select-container">
                                            <select className="settings-select">
                                                <option>6:00 PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-form-group">
                                    <label className="form-label">Preferred time to meet for work</label>
                                    <div className="toggle-options-list">
                                        <div className="toggle-option-card disabled">
                                            <div className="card-left">
                                                <div className="card-icon"><CloudSun size={18} /></div>
                                                <span className="card-label">Mornings</span>
                                            </div>
                                            <div className="settings-toggle off"></div>
                                        </div>

                                        <div
                                            className={`toggle-option-card ${timePreference === 'Mid-Day' ? 'active' : ''}`}
                                            onClick={() => setTimePreference('Mid-Day')}
                                        >
                                            <div className="card-left">
                                                <div className="card-icon"><Sun size={18} /></div>
                                                <span className="card-label">Mid-Day</span>
                                            </div>
                                            <div className="settings-toggle on"></div>
                                        </div>

                                        <div
                                            className={`toggle-option-card ${timePreference === 'Afternoons' ? 'active' : ''}`}
                                            onClick={() => setTimePreference('Afternoons')}
                                        >
                                            <div className="card-left">
                                                <div className="card-icon"><CloudRain size={18} /></div>
                                                <span className="card-label">Afternoons</span>
                                            </div>
                                            <div className="settings-toggle on"></div>
                                        </div>

                                        <div className="toggle-option-card disabled">
                                            <div className="card-left">
                                                <div className="card-icon"><Moon size={18} /></div>
                                                <span className="card-label">Evenings</span>
                                            </div>
                                            <div className="settings-toggle off"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
