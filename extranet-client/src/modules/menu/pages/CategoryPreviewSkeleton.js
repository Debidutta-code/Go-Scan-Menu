import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { generateCategoryMasonryPattern } from '@/public-app/utils/categoryMasonryPattern';
import './CategoryPreviewSkeleton.css';
export const CategoryPreviewSkeleton = ({ saving = false, count = 8, }) => {
    const skeletonPattern = generateCategoryMasonryPattern(count);
    return (_jsx("div", { className: "category-preview-wrapper", children: _jsx("div", { className: "category-preview-grid", children: skeletonPattern.map((isLarge, index) => (_jsxs("div", { className: `staff-category-sort-skeleton-preview-card ${isLarge ? 'large' : 'small'}`, children: [_jsx("div", { className: "staff-category-sort-skeleton-preview-image" }), _jsxs("div", { className: "staff-category-sort-skeleton-preview-overlay", children: [_jsx("div", { className: "staff-category-sort-skeleton-preview-name" }), _jsx("div", { className: "staff-category-sort-skeleton-preview-count" })] })] }, index))) }) }));
};
