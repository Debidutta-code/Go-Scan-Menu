import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Switch.css';
export const Switch = ({ checked, onChange, label, id, disabled }) => {
    return (_jsxs("div", { className: `switch-container ${disabled ? 'disabled' : ''}`, onClick: () => !disabled && onChange(), "data-testid": id, children: [_jsx("div", { className: `switch-track ${checked ? 'checked' : ''}`, children: _jsx("div", { className: "switch-thumb" }) }), label && _jsx("span", { className: "switch-label", children: label })] }));
};
