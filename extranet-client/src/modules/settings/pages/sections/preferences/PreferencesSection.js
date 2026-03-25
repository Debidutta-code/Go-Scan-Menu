import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Calendar, Sun, CloudSun, CloudRain, Moon, CheckCircle, AlertCircle } from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
const PreferencesSection = () => {
    const { staff, token, updateCurrentStaff } = useStaffAuth();
    // Local state for form fields
    const [timePreference, setTimePreference] = useState(staff?.preferences?.timePreference || 'Mid-Day');
    const [startHour, setStartHour] = useState(staff?.preferences?.workingHours?.start || '9:00 AM');
    const [endHour, setEndHour] = useState(staff?.preferences?.workingHours?.end || '6:00 PM');
    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);
    // Sync with staff context if it changes
    useEffect(() => {
        if (staff?.preferences) {
            setTimePreference(staff.preferences.timePreference || 'Mid-Day');
            setStartHour(staff.preferences.workingHours?.start || '9:00 AM');
            setEndHour(staff.preferences.workingHours?.end || '6:00 PM');
        }
    }, [staff]);
    const handleSave = async () => {
        if (!token)
            return;
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
        }
        catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
        }
        finally {
            setIsSaving(false);
            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        }
    };
    return (_jsxs("div", { className: "settings-section", children: [_jsxs("div", { className: "settings-notice-banner", children: [_jsx("div", { className: "notice-icon", children: _jsx(Calendar, { size: 18 }) }), _jsxs("div", { className: "notice-text", children: [_jsx("span", { className: "notice-label", children: "Notice:" }), "Availability settings have moved to schedules"] }), _jsx("button", { className: "notice-action-btn", children: "Go to Schedules" })] }), _jsx("h3", { className: "section-title", children: "Event Preferences" }), _jsxs("div", { className: "settings-form-group", children: [_jsx("label", { className: "form-label", children: "What are your normal working hours?" }), _jsxs("div", { className: "time-picker-row", children: [_jsx("div", { className: "select-container", children: _jsx("select", { className: "settings-select", value: startHour, onChange: (e) => setStartHour(e.target.value), children: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'].map(time => (_jsx("option", { value: time, children: time }, time))) }) }), _jsx("span", { className: "time-separator", children: "TO" }), _jsx("div", { className: "select-container", children: _jsx("select", { className: "settings-select", value: endHour, onChange: (e) => setEndHour(e.target.value), children: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'].map(time => (_jsx("option", { value: time, children: time }, time))) }) })] })] }), _jsxs("div", { className: "settings-form-group", children: [_jsx("label", { className: "form-label", children: "Preferred time to meet for work" }), _jsxs("div", { className: "toggle-options-list", children: [_jsxs("div", { className: "toggle-option-card disabled", children: [_jsxs("div", { className: "card-left", children: [_jsx("div", { className: "card-icon", children: _jsx(CloudSun, { size: 18 }) }), _jsx("span", { className: "card-label", children: "Mornings" })] }), _jsx("div", { className: "settings-toggle off" })] }), _jsxs("div", { className: `toggle-option-card ${timePreference === 'Mid-Day' ? 'active' : ''}`, onClick: () => setTimePreference('Mid-Day'), children: [_jsxs("div", { className: "card-left", children: [_jsx("div", { className: "card-icon", children: _jsx(Sun, { size: 18 }) }), _jsx("span", { className: "card-label", children: "Mid-Day" })] }), _jsx("div", { className: "settings-toggle on" })] }), _jsxs("div", { className: `toggle-option-card ${timePreference === 'Afternoons' ? 'active' : ''}`, onClick: () => setTimePreference('Afternoons'), children: [_jsxs("div", { className: "card-left", children: [_jsx("div", { className: "card-icon", children: _jsx(CloudRain, { size: 18 }) }), _jsx("span", { className: "card-label", children: "Afternoons" })] }), _jsx("div", { className: "settings-toggle on" })] }), _jsxs("div", { className: `toggle-option-card ${timePreference === 'Evenings' ? 'active' : ''}`, onClick: () => setTimePreference('Evenings'), children: [_jsxs("div", { className: "card-left", children: [_jsx("div", { className: "card-icon", children: _jsx(Moon, { size: 18 }) }), _jsx("span", { className: "card-label", children: "Evenings" })] }), _jsx("div", { className: timePreference === 'Evenings' ? 'settings-toggle on' : 'settings-toggle off' })] })] })] }), _jsxs("div", { style: { marginTop: '32px', display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsx("button", { className: "settings-submit-btn", onClick: handleSave, disabled: isSaving, style: { width: 'auto', padding: '0 32px' }, children: isSaving ? 'Saving...' : 'Save Preferences' }), message && (_jsxs("div", { className: `form-feedback ${message.type}`, style: { margin: 0, padding: 0, backgroundColor: 'transparent', border: 'none' }, children: [message.type === 'success' ? _jsx(CheckCircle, { size: 16 }) : _jsx(AlertCircle, { size: 16 }), message.text] }))] })] }));
};
export default PreferencesSection;
