import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MenuItemCard } from '../MenuItemCard/MenuItemCard';
import './CategorySection.css';
export const CategorySection = ({ category, currency, onItemClick, onAddClick, }) => {
    return (_jsxs("section", { id: `category-${category._id}`, className: "category-section-container", children: [_jsxs("div", { className: "category-section-header", children: [_jsx("h2", { className: "category-section-title", children: category.name }), category.description && (_jsx("p", { className: "category-section-description", children: category.description }))] }), _jsx("div", { className: "category-section-items-list", children: category.items.map((item) => (_jsx(MenuItemCard, { item: item, currency: currency, onItemClick: onItemClick, onAddClick: onAddClick }, item._id))) })] }));
};
