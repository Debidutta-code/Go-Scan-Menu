import React, { useState } from 'react';
import {
    User,
    Calendar,
    Settings as SettingsIcon,
    Clock,
    Layers,
    HelpCircle,
    ChevronRight,
    Bell,
    ArrowRight,
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
    <div className={`s-cat-item ${active ? 's-cat-item--active' : ''}`} onClick={onClick}>
        <div className="s-cat-icon">{icon}</div>
        <span className="s-cat-label">{label}</span>
        {badge && <span className="s-cat-badge">{badge}</span>}
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
        <div className="s-layout">
            {/* Sidebar / Category Bar */}
            <div className="s-sidebar">
                <h1 className="s-title">Settings</h1>
                <div className="s-cat-list">
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
                <div className="s-sidebar-footer">
                    <CategoryItem
                        icon={<HelpCircle size={18} />}
                        label="Help Center"
                        onClick={() => { }}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="s-content">
                {/* Notice Banner */}
                <div className="s-notice">
                    <div className="s-notice-icon">
                        <Calendar size={20} />
                    </div>
                    <div className="s-notice-text">
                        <span className="s-notice-label">Notice</span>
                        <p className="s-notice-desc">Availability settings have moved to schedules</p>
                    </div>
                    <button className="s-notice-btn">
                        Go to Schedules
                    </button>
                </div>

                <div className="s-section">
                    <h2 className="s-section-title">Event Preferences</h2>

                    <div className="s-card">
                        <div className="s-field">
                            <label className="s-label">What are your normal working hours?</label>
                            <div className="s-time-picker-group">
                                <div className="s-select-wrap">
                                    <select className="s-select">
                                        <option>9:00 AM</option>
                                    </select>
                                </div>
                                <span className="s-time-separator">TO</span>
                                <div className="s-select-wrap">
                                    <select className="s-select">
                                        <option>6:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="s-field">
                            <label className="s-label">Preferred time to meet for work</label>
                            <div className="s-toggle-list">
                                <div className="s-toggle-item s-toggle-item--disabled">
                                    <div className="s-toggle-left">
                                        <div className="s-toggle-icon"><CloudSun size={20} /></div>
                                        <span className="s-toggle-label">Mornings</span>
                                    </div>
                                    <div className="s-switch s-switch--off"></div>
                                </div>

                                <div
                                    className={`s-toggle-item ${timePreference === 'Mid-Day' ? 's-toggle-item--active' : ''}`}
                                    onClick={() => setTimePreference('Mid-Day')}
                                >
                                    <div className="s-toggle-left">
                                        <div className="s-toggle-icon"><Sun size={20} /></div>
                                        <span className="s-toggle-label">Mid-Day</span>
                                    </div>
                                    <div className="s-switch s-switch--on"></div>
                                </div>

                                <div
                                    className={`s-toggle-item ${timePreference === 'Afternoons' ? 's-toggle-item--active' : ''}`}
                                    onClick={() => setTimePreference('Afternoons')}
                                >
                                    <div className="s-toggle-left">
                                        <div className="s-toggle-icon"><CloudRain size={20} /></div>
                                        <span className="s-toggle-label">Afternoons</span>
                                    </div>
                                    <div className="s-switch s-switch--on"></div>
                                </div>

                                <div className="s-toggle-item s-toggle-item--disabled">
                                    <div className="s-toggle-left">
                                        <div className="s-toggle-icon"><Moon size={20} /></div>
                                        <span className="s-toggle-label">Evenings</span>
                                    </div>
                                    <div className="s-switch s-switch--off"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
