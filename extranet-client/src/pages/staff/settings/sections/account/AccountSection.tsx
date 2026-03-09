import React from 'react';
import ChangePasswordForm from './ChangePasswordForm';

interface AccountSectionProps {
    staff: any;
    token: string;
}

const AccountSection: React.FC<AccountSectionProps> = ({ staff, token }) => {
    return (
        <div className="settings-section">
            <div className="account-info-banner">
                <div className="user-avatar-large">
                    {staff?.name?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                    <h3 className="user-full-name">{staff?.name}</h3>
                    <p className="user-email-text">{staff?.email}</p>
                    <span className="user-role-badge">{staff?.staffType}</span>
                </div>
            </div>

            <div className="settings-sub-section">
                <h3 className="section-title">Security</h3>
                <ChangePasswordForm token={token} />
            </div>
        </div>
    );
};

export default AccountSection;
