import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ChangePasswordForm from './ChangePasswordForm';
const AccountSection = ({ staff, token }) => {
    return (_jsxs("div", { className: "settings-section", children: [_jsxs("div", { className: "account-info-banner", children: [_jsx("div", { className: "user-avatar-large", children: staff?.name?.charAt(0) || 'U' }), _jsxs("div", { className: "user-details", children: [_jsx("h3", { className: "user-full-name", children: staff?.name }), _jsx("p", { className: "user-email-text", children: staff?.email }), _jsx("span", { className: "user-role-badge", children: staff?.staffType })] })] }), _jsxs("div", { className: "settings-sub-section", children: [_jsx("h3", { className: "section-title", children: "Security" }), _jsx(ChangePasswordForm, { token: token })] })] }));
};
export default AccountSection;
