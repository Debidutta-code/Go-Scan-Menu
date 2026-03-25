import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './CategoryListSkeleton.css';
export const CategoryListSkeleton = () => {
    return (_jsx("div", { className: "category-list", children: [1, 2, 3, 4, 5].map((i) => (_jsxs("div", { className: "staff-category-sort-skeleton-item", children: [_jsx("div", { className: "staff-category-sort-skeleton-handle" }), _jsxs("div", { className: "staff-category-sort-skeleton-content", children: [_jsxs("div", { className: "staff-category-sort-skeleton-main", children: [_jsx("div", { className: "staff-category-sort-skeleton-title" }), _jsx("div", { className: "staff-category-sort-skeleton-description" }), _jsxs("div", { className: "staff-category-sort-skeleton-meta", children: [_jsx("div", { className: "staff-category-sort-skeleton-badge" }), _jsx("div", { className: "staff-category-sort-skeleton-badge" })] })] }), _jsx("div", { className: "staff-category-sort-skeleton-button" })] })] }, i))) }));
};
