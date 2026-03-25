import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
export const SortablePreviewCard = ({ category, isLarge }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category._id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 1000 : 'auto',
    };
    return (_jsxs("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, className: `category-preview-card ${isLarge ? 'large' : 'small'} ${isDragging ? 'dragging' : ''}`, children: [category.image ? (_jsx("img", { src: category.image, alt: category.name, className: "category-preview-image", draggable: false })) : (_jsx("div", { className: "category-preview-placeholder", children: _jsx("span", { className: "category-preview-placeholder-icon", children: "\uD83C\uDF74" }) })), _jsxs("div", { className: "category-preview-overlay", children: [_jsx("h3", { className: "category-preview-name", children: category.name }), _jsx("p", { className: "category-preview-count", children: "View items" })] })] }));
};
