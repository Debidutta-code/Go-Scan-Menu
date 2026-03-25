import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { generateCategoryMasonryPattern } from '@/public-app/utils/categoryMasonryPattern';
import './CategoryGrid.css';
export const CategoryGrid = ({ categories, onCategoryClick, }) => {
    const handleClick = (categoryId) => {
        onCategoryClick(categoryId);
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
            const offsetPosition = element.offsetTop - 150;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };
    const pattern = generateCategoryMasonryPattern(categories.length);
    return (_jsx("div", { className: "public-category-grid-section", children: _jsx("div", { className: "public-category-grid", children: categories.map((category, index) => (_jsxs("div", { className: `public-category-grid-card ${pattern[index] ? 'large' : 'small'}`, onClick: () => handleClick(category._id), children: [category.image ? (_jsx("img", { src: category.image, alt: category.name, className: "public-category-grid-card-image" })) : (_jsx("div", { className: "public-category-grid-card-placeholder", children: _jsx("span", { className: "public-category-grid-placeholder-icon", children: "\uD83C\uDF74" }) })), _jsxs("div", { className: "public-category-grid-card-overlay", children: [_jsx("h3", { className: "public-category-grid-card-name", children: category.name }), _jsxs("p", { className: "public-category-grid-card-count", children: [category.items.length, " items"] })] })] }, category._id))) }) }));
};
