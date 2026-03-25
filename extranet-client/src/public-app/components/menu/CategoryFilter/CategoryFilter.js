import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { ALL_CATEGORIES_ID, ALL_CATEGORIES_NAME, SCROLL_OFFSET } from '@/public-app/utils/constants';
import './CategoryFilter.css';
export const CategoryFilter = ({ categories, activeCategory, onCategoryChange, }) => {
    const scrollContainerRef = useRef(null);
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeButton = scrollContainerRef.current.querySelector('.public-category-filter-btn.active');
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeCategory]);
    const handleCategoryClick = (categoryId) => {
        onCategoryChange(categoryId);
        if (categoryId === ALL_CATEGORIES_ID) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else {
            const element = document.getElementById(`category-${categoryId}`);
            if (element) {
                const offsetPosition = element.offsetTop - SCROLL_OFFSET;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }
    };
    return (_jsx("div", { className: "public-category-filter-container", children: _jsxs("div", { className: "public-category-filter-scroll", ref: scrollContainerRef, children: [_jsxs("button", { className: `public-category-filter-btn ${activeCategory === ALL_CATEGORIES_ID ? 'active' : ''}`, onClick: () => handleCategoryClick(ALL_CATEGORIES_ID), children: [_jsx("div", { className: "public-category-filter-icon", children: _jsx("span", { className: "public-category-filter-emoji", children: "\uD83C\uDF7D\uFE0F" }) }), _jsx("span", { className: "public-category-filter-name", children: ALL_CATEGORIES_NAME })] }), categories.map((category) => (_jsxs("button", { className: `public-category-filter-btn ${activeCategory === category._id ? 'active' : ''}`, onClick: () => handleCategoryClick(category._id), children: [_jsx("div", { className: "public-category-filter-icon", children: category.image ? (_jsx("img", { src: category.image, alt: category.name, className: "public-category-filter-img" })) : (_jsx("span", { className: "public-category-filter-emoji", children: "\uD83C\uDF74" })) }), _jsx("span", { className: "public-category-filter-name", children: category.name })] }, category._id)))] }) }));
};
