import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Error.css';
export const Error = ({ message }) => {
    return (_jsxs("div", { className: "error-screen", children: [_jsx("h2", { children: "\u26A0\uFE0F Oops!" }), _jsx("p", { children: message })] }));
};
