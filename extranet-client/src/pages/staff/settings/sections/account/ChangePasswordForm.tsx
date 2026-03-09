import React, { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { StaffService } from '@/services/staff.service';

interface ChangePasswordFormProps {
    token: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ token }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChanging, setIsChanging] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setIsChanging(true);
        setMessage(null);

        try {
            await StaffService.changePassword(token, currentPassword, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update password' });
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <form className="change-password-form" onSubmit={handleChangePassword}>
            <p className="form-description">Update your password to keep your account secure.</p>

            {message && (
                <div className={`form-feedback ${message.type}`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div className="settings-form-group">
                <label className="form-label">Current Password</label>
                <div className="input-with-icon">
                    <Lock size={16} className="field-icon" />
                    <input
                        type="password"
                        className="settings-input"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="settings-form-row">
                <div className="settings-form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-with-icon">
                        <Lock size={16} className="field-icon" />
                        <input
                            type="password"
                            className="settings-input"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="settings-form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-with-icon">
                        <Lock size={16} className="field-icon" />
                        <input
                            type="password"
                            className="settings-input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="settings-submit-btn"
                disabled={isChanging}
            >
                {isChanging ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

export default ChangePasswordForm;
