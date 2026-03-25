import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import './SkeletonLoader.css';
/**
 * Reusable skeleton loading placeholder
 */
export const SkeletonLoader = ({ variant = 'text', count = 1, width, height, className = '', }) => {
    if (count <= 0)
        return null;
    const items = Array.from({ length: count });
    if (variant === 'table-row') {
        return (_jsx(_Fragment, { children: items.map((_, i) => (_jsxs("tr", { className: "skeleton-row", children: [_jsx("td", { children: _jsx("div", { className: "skeleton skeleton-text-short" }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-pill" }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-text-short" }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-text-short" }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-text-medium" }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-badge" }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-badge" }) }), _jsx("td", { children: _jsxs("div", { className: "skeleton-time", children: [_jsx("div", { className: "skeleton skeleton-text-tiny" }), _jsx("div", { className: "skeleton skeleton-text-tiny" })] }) }), _jsx("td", { children: _jsx("div", { className: "skeleton skeleton-icon-btn" }) })] }, i))) }));
    }
    if (variant === 'stats-card') {
        return (_jsx(_Fragment, { children: items.map((_, i) => (_jsxs("div", { className: "summary-card skeleton-stats-card", children: [_jsx("div", { className: "summary-icon skeleton-circle" }), _jsxs("div", { className: "summary-content", children: [_jsx("div", { className: "skeleton skeleton-value" }), _jsx("div", { className: "skeleton skeleton-label" }), _jsx("div", { className: "skeleton skeleton-sub" })] })] }, i))) }));
    }
    // fallback / simple shapes
    const style = {};
    if (width)
        style.width = width;
    if (height)
        style.height = height;
    return (_jsx(_Fragment, { children: items.map((_, i) => {
            if (variant === 'circle') {
                return _jsx("div", { className: `skeleton skeleton-circle ${className}`, style: style }, i);
            }
            if (variant === 'detail-panel') {
                return (_jsxs("div", { className: `skeleton-detail-panel ${className}`, children: [_jsx("div", { className: "skeleton skeleton-header" }), _jsx("div", { className: "skeleton skeleton-meta-row" }), _jsx("div", { className: "skeleton skeleton-section-title" }), _jsx("div", { className: "skeleton skeleton-item-row", style: { height: '68px' } }), _jsx("div", { className: "skeleton skeleton-item-row", style: { height: '68px' } }), _jsx("div", { className: "skeleton skeleton-item-row", style: { height: '48px' } })] }, i));
            }
            if (variant === 'pagination') {
                return (_jsxs("div", { className: "o-pagination skeleton-pagination", children: [_jsx("div", { className: "skeleton skeleton-icon-btn", style: { width: '32px', height: '32px' } }), _jsx("div", { className: "skeleton skeleton-icon-btn", style: { width: '32px', height: '32px' } }), _jsx("div", { className: "skeleton skeleton-icon-btn", style: { width: '32px', height: '32px' } }), _jsx("div", { className: "skeleton skeleton-icon-btn", style: { width: '32px', height: '32px' } }), _jsx("div", { className: "skeleton skeleton-icon-btn", style: { width: '32px', height: '32px' } })] }, i));
            }
            // default: text line
            return _jsx("div", { className: `skeleton skeleton-text ${className}`, style: style }, i);
        }) }));
};
