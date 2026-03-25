import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/components/Button';
import './SortableCategoryItem.css';
export const SortableCategoryItem = ({ category, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category._id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (_jsxs("div", { ref: setNodeRef, style: style, className: `sortable-category-item ${isDragging ? 'dragging' : ''}`, children: [_jsx("div", { className: "drag-handle", ...attributes, ...listeners, children: _jsxs("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M7 4C7 4.55228 6.55228 5 6 5C5.44772 5 5 4.55228 5 4C5 3.44772 5.44772 3 6 3C6.55228 3 7 3.44772 7 4Z", fill: "currentColor" }), _jsx("path", { d: "M7 10C7 10.5523 6.55228 11 6 11C5.44772 11 5 10.5523 5 10C5 9.44772 5.44772 9 6 9C6.55228 9 7 9.44772 7 10Z", fill: "currentColor" }), _jsx("path", { d: "M7 16C7 16.5523 6.55228 17 6 17C5.44772 17 5 16.5523 5 16C5 15.4477 5.44772 15 6 15C6.55228 15 7 15.4477 7 16Z", fill: "currentColor" }), _jsx("path", { d: "M13 4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4Z", fill: "currentColor" }), _jsx("path", { d: "M13 10C13 10.5523 12.5523 11 12 11C11.4477 11 11 10.5523 11 10C11 9.44772 11.4477 9 12 9C12.5523 9 13 9.44772 13 10Z", fill: "currentColor" }), _jsx("path", { d: "M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z", fill: "currentColor" })] }) }), _jsxs("div", { className: "category-item-content", children: [_jsxs("div", { className: "category-item-main", children: [_jsxs("div", { className: "category-item-info", children: [_jsx("h3", { className: "category-item-name", children: category.name }), _jsx("p", { className: "category-item-description", children: category.description || 'No description' })] }), _jsxs("div", { className: "category-item-meta", children: [_jsx("span", { className: "category-item-scope", children: category.scope === 'restaurant' ? '🏢 Restaurant-wide' : '🏪 Branch-specific' }), _jsx("span", { className: `category-item-status ${category.isActive ? 'active' : 'inactive'}`, children: category.isActive ? '● Active' : '○ Inactive' })] })] }), _jsx("div", { className: "category-item-actions", children: _jsx(Button, { variant: "outline", onClick: onEdit, children: "Edit" }) })] })] }));
};
