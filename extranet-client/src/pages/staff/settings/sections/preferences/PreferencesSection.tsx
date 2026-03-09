import React from 'react';
import { Calendar, Sun, CloudSun, CloudRain, Moon } from 'lucide-react';

interface PreferencesSectionProps {
    timePreference: string;
    setTimePreference: (pref: string) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
    timePreference,
    setTimePreference
}) => {
    return (
        <div className="settings-section">
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
    );
};

export default PreferencesSection;
