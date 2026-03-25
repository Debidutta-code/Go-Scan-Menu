import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { generateCategoryMasonryPattern } from '@/public-app/utils/categoryMasonryPattern';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortablePreviewCard } from './SortablePreviewCard';
import { CategoryPreviewSkeleton } from './CategoryPreviewSkeleton';
import './CategoryPreview.css';
export const CategoryPreview = ({ categories, loading = false, saving = false, }) => {
    const activeCategories = categories.filter((cat) => cat.isActive);
    const pattern = generateCategoryMasonryPattern(activeCategories.length);
    if (loading) {
        // Show skeleton with a default count when initially loading
        return _jsx(CategoryPreviewSkeleton, { count: 6 });
    }
    if (saving) {
        // Show skeleton with actual category count when saving
        return _jsx(CategoryPreviewSkeleton, { saving: true, count: activeCategories.length });
    }
    if (activeCategories.length === 0) {
        return (_jsxs("div", { className: "preview-empty-state", children: [_jsx("div", { className: "preview-empty-icon", children: "\uD83D\uDCCB" }), _jsx("p", { children: "No active categories to display" })] }));
    }
    return (_jsx("div", { className: "category-preview-wrapper", children: _jsx(SortableContext, { items: activeCategories.map((cat) => cat._id), strategy: rectSortingStrategy, children: _jsx("div", { className: "category-preview-grid", children: activeCategories.map((category, index) => (_jsx(SortablePreviewCard, { category: category, isLarge: pattern[index] }, category._id))) }) }) }));
};
