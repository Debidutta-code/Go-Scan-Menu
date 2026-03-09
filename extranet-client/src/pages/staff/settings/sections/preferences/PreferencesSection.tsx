import React, { useState, useEffect } from 'react';
import { Calendar, Sun, CloudSun, CloudRain, Moon, CheckCircle, AlertCircle } from 'lucide-react';
import { useStaffAuth } from '../../../../../contexts/StaffAuthContext';
import { StaffService } from '../../../../../services/staff.service';

const PreferencesSection: React.FC = () => {
    const { staff, token, updateCurrentStaff } = useStaffAuth();

    // Local state for form fields
    const [timePreference, setTimePreference] = useState(staff?.preferences?.timePreference || 'Mid-Day');
    const [startHour, setStartHour] = useState(staff?.preferences?.workingHours?.start || '9:00 AM');
    const [endHour, setEndHour] = useState(staff?.preferences?.workingHours?.end || '6:00 PM');

    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync with staff context if it changes
    useEffect(() => {
        if (staff?.preferences) {
            setTimePreference(staff.preferences.timePreference || 'Mid-Day');
            setStartHour(staff.preferences.workingHours?.start || '9:00 AM');
            setEndHour(staff.preferences.workingHours?.end || '6:00 PM');
        }
    }, [staff]);

    const handleSave = async () => {
        if (!token) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const preferences = {
                timePreference,
                workingHours: {
                    start: startHour,
                    end: endHour
                }
            };

            const response = await StaffService.updateProfile(token, { preferences });
            if (response.data) {
                updateCurrentStaff({ preferences: response.data.preferences });
                setMessage({ type: 'success', text: 'Preferences saved successfully' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
        } finally {
            setIsSaving(false);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        }
    };

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
                        <select
                            className="settings-select"
                            value={startHour}
                            onChange={(e) => setStartHour(e.target.value)}
                        >
                            {['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'].map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                    <span className="time-separator">TO</span>
                    <div className="select-container">
                        <select
                            className="settings-select"
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
                        >
                            {['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'].map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
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

                    <div
                        className={`toggle-option-card ${timePreference === 'Evenings' ? 'active' : ''}`}
                        onClick={() => setTimePreference('Evenings')}
                    >
                        <div className="card-left">
                            <div className="card-icon"><Moon size={18} /></div>
                            <span className="card-label">Evenings</span>
                        </div>
                        <div className={timePreference === 'Evenings' ? 'settings-toggle on' : 'settings-toggle off'}></div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    className="settings-submit-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ width: 'auto', padding: '0 32px' }}
                >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>

                {message && (
                    <div className={`form-feedback ${message.type}`} style={{ margin: 0, padding: 0, backgroundColor: 'transparent', border: 'none' }}>
                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreferencesSection;
