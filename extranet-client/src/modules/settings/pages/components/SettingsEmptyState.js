import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SettingsEmptyState = ({ icon, title }) => {
    return (_jsxs("div", { className: "settings-empty-state", children: [_jsx("div", { className: "empty-state-icon", children: icon }), _jsxs("h3", { className: "empty-state-title", children: [title, " Settings"] }), _jsx("p", { className: "empty-state-text", children: "This section is coming soon. Stay tuned!" })] }));
};
export default SettingsEmptyState;
