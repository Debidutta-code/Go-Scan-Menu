import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';
export const Breadcrumb = ({ items, className = '' }) => {
    return (_jsx("nav", { className: `breadcrumb ${className}`, "aria-label": "Breadcrumb", children: _jsxs("ol", { className: "breadcrumb-list", children: [_jsxs("li", { className: "breadcrumb-item", children: [_jsx(Link, { to: "/staff/dashboard", className: "breadcrumb-link icon-link", children: _jsx(Home, { size: 14 }) }), _jsx(ChevronRight, { size: 14, className: "breadcrumb-separator" })] }), items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (_jsxs("li", { className: `breadcrumb-item ${isLast ? 'active' : ''}`, children: [item.to && !isLast ? (_jsx(Link, { to: item.to, className: "breadcrumb-link", children: item.label })) : (_jsx("span", { className: "breadcrumb-text", children: item.label })), !isLast && (_jsx(ChevronRight, { size: 14, className: "breadcrumb-separator" }))] }, index));
                })] }) }));
};
