import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './styles/Loader.css';
export const Loader = ({ size = 'md', variant = 'spinner', fullscreen = false, message, color = 'primary', }) => {
    const containerClasses = ['loader-container', fullscreen && 'loader-fullscreen']
        .filter(Boolean)
        .join(' ');
    const loaderClasses = ['loader', `loader-${variant}`, `loader-${size}`, `loader-${color}`]
        .filter(Boolean)
        .join(' ');
    const renderLoader = () => {
        switch (variant) {
            case 'spinner':
                return (_jsx("div", { className: loaderClasses, children: _jsx("div", { className: "loader-spinner-circle" }) }));
            case 'dots':
                return (_jsxs("div", { className: loaderClasses, children: [_jsx("div", { className: "loader-dot" }), _jsx("div", { className: "loader-dot" }), _jsx("div", { className: "loader-dot" })] }));
            case 'pulse':
                return (_jsx("div", { className: loaderClasses, children: _jsx("div", { className: "loader-pulse-circle" }) }));
            default:
                return null;
        }
    };
    return (_jsx("div", { className: containerClasses, children: _jsxs("div", { className: "loader-content", children: [renderLoader(), message && _jsx("p", { className: "loader-message", children: message })] }) }));
};
