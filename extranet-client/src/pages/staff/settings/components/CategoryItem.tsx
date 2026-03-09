import React from 'react';

interface CategoryItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    badge?: string;
    onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ icon, label, active, badge, onClick }) => (
    <div className={`settings-cat-item ${active ? 'active' : ''}`} onClick={onClick}>
        <div className="cat-icon">{icon}</div>
        <span className="cat-label">{label}</span>
        {badge && <span className="cat-badge">{badge}</span>}
    </div>
);

export default CategoryItem;
