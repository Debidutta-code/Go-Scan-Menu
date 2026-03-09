import React from 'react';
import { HelpCircle } from 'lucide-react';
import CategoryItem from './CategoryItem';

interface SettingsLayoutProps {
    children: React.ReactNode;
    activeCategory: string;
    onCategoryChange: (id: string) => void;
    categories: { id: string; icon: React.ReactNode; label: string; badge?: string }[];
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    children,
    activeCategory,
    onCategoryChange,
    categories
}) => {
    return (
        <div className="settings-page-layout">
            {/* Page Actions Toolbar */}
            <div className="settings-page-toolbar">
                <div className="toolbar-left">
                    <h1 className="settings-page-title">Settings</h1>
                    <p className="toolbar-subtitle">Manage your account and app preferences</p>
                </div>
                <div className="settings-toolbar-actions">
                    <span className="status-badge active">System Live</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="settings-page-content">
                <div className="settings-grid">
                    {/* Left Panel - Category Bar */}
                    <div className="settings-sidebar-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Categories</h2>
                        </div>
                        <div className="panel-content">
                            <div className="settings-cat-list">
                                {categories.map(cat => (
                                    <CategoryItem
                                        key={cat.id}
                                        icon={cat.icon}
                                        label={cat.label}
                                        active={activeCategory === cat.id}
                                        badge={cat.badge}
                                        onClick={() => onCategoryChange(cat.id)}
                                    />
                                ))}
                            </div>
                            <div className="settings-cat-footer">
                                <CategoryItem
                                    icon={<HelpCircle size={18} />}
                                    label="Help Center"
                                    onClick={() => { }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Settings Content */}
                    <div className="settings-main-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">{activeCategory}</h2>
                        </div>
                        <div className="panel-content">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
