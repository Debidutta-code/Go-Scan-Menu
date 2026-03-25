import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useCart } from '@/public-app/contexts/CartContext';
import { useScrollSpy } from '@/public-app/hooks/useScrollSpy';
import { ALL_CATEGORIES_ID } from '@/public-app/utils/constants';
import './MenuPage.css';
export const MenuPage = () => {
    const { menuData } = usePublicApp();
    const { addItem } = useCart();
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES_ID);
    const categoryIds = useMemo(() => menuData.menu.map((cat) => cat._id), [menuData.menu]);
    const scrollSpyCategory = useScrollSpy(categoryIds.map((id) => `category-${id}`));
    React.useEffect(() => {
        if (scrollSpyCategory) {
            const categoryId = scrollSpyCategory.replace('category-', '');
            setActiveCategory(categoryId);
        }
        else if (window.scrollY < 300) {
            setActiveCategory(ALL_CATEGORIES_ID);
        }
    }, [scrollSpyCategory]);
    const handleItemClick = (item) => {
        setSelectedItem(item);
    };
    const handleAddClick = (item) => {
        // If it has variants, we should open the detail view instead of adding directly
        if (item.variants && item.variants.length > 0) {
            setSelectedItem(item);
        }
        else {
            addItem(item);
        }
    };
    const handleAddToCart = (item, variant, addons = [], quantity = 1) => {
        addItem(item, variant, addons, quantity);
        setSelectedItem(null);
    };
    return (_jsxs("div", { className: "wrapper-menu-page", children: [_jsx(CategoryFilter, { categories: menuData.menu, activeCategory: activeCategory, onCategoryChange: setActiveCategory }), _jsx("div", { className: "menu-page-content", children: activeCategory === ALL_CATEGORIES_ID ? (_jsx(CategoryGrid, { categories: menuData.menu, onCategoryClick: setActiveCategory })) : (menuData.menu.map((category) => (_jsx(CategorySection, { category: category, currency: menuData.branch.settings.currency, onItemClick: handleItemClick, onAddClick: handleAddClick }, category._id)))) }), selectedItem && (_jsx(MenuItemDetail, { item: selectedItem, currency: menuData.branch.settings.currency, isOpen: !!selectedItem, onClose: () => setSelectedItem(null), onAddToCart: handleAddToCart }))] }));
};
