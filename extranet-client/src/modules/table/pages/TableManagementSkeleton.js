import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './TableManagementSkeleton.css';
export const TableManagementSkeleton = () => {
    return (_jsx("div", { className: "table-management-skeleton", children: _jsxs("div", { className: "skeleton-content", children: [_jsx("div", { className: "skeleton-panel-header skeleton-shimmer" }), [1, 2].map((group) => (_jsxs("div", { className: "skeleton-location-group", children: [_jsx("div", { className: "skeleton-location-header skeleton-shimmer" }), _jsx("div", { className: "skeleton-grid", children: Array.from({ length: group === 1 ? 12 : 8 }).map((_, i) => (_jsx("div", { className: "skeleton-cube skeleton-shimmer" }, i))) })] }, group)))] }) }));
};
