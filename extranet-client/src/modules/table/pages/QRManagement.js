import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/staff/QRManagement.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { QRConfigService } from '@/modules/table/services/qrconfig.service';
import { BranchService } from '@/modules/branch/services/branch.service';
import { Button } from '@/shared/components/Button';
import { QR_STYLES, getQRStylesArray } from '@/shared/config/qrStyles.config';
import { getTemplate, getTemplatesArray, TEMPLATE_CATEGORIES, } from '@/shared/config/qrTemplates.config';
import { QRTemplateRenderer } from '@/modules/table/components/QRTemplateRenderer';
import { TableManagementSkeleton } from './TableManagementSkeleton';
import './QRManagement.css';
export const QRManagement = () => {
    const navigate = useNavigate();
    const { branchId } = useParams();
    const { staff, token } = useStaffAuth();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Mode selection
    const [designMode, setDesignMode] = useState('simple');
    // Style management (simple mode)
    const [selectedStyle, setSelectedStyle] = useState('classic');
    const [customMode, setCustomMode] = useState(false);
    const [showAllStyles, setShowAllStyles] = useState(false);
    // Template management (template mode)
    const [selectedTemplate, setSelectedTemplate] = useState('classic_tent');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    // Custom color settings
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [level, setLevel] = useState('H');
    // Logo settings
    const [logoSrc, setLogoSrc] = useState();
    const [logoDimensions, setLogoDimensions] = useState(undefined);
    const [logoScale] = useState(22);
    const fileInputRef = useRef(null);
    const qrSize = 300;
    const maxLogoSize = qrSize * (logoScale / 100);
    // Dummy QR URL for preview
    const dummyQrUrl = `${window.location.origin}/menu/restaurant/branch/table-1`;
    // Apply preset style when selected (simple mode)
    useEffect(() => {
        if (designMode === 'simple' && !customMode && selectedStyle) {
            const style = QR_STYLES[selectedStyle];
            if (style) {
                setFgColor(style.fgColor);
                setBgColor(style.bgColor);
                setLevel(style.level);
            }
        }
    }, [selectedStyle, customMode, designMode]);
    // Apply template QR settings when selected (template mode)
    useEffect(() => {
        if (designMode === 'template' && selectedTemplate) {
            const template = getTemplate(selectedTemplate);
            if (template.qrConfig) {
                setFgColor(template.qrConfig.fgColor);
                setBgColor(template.qrConfig.bgColor);
                setLevel(template.qrConfig.level);
            }
        }
    }, [selectedTemplate, designMode]);
    useEffect(() => {
        if (staff && token && branchId) {
            loadData();
        }
    }, [staff, token, branchId]);
    const loadData = async () => {
        if (!staff || !token || !branchId)
            return;
        setLoading(true);
        setError('');
        try {
            // Load branch details
            const branchResponse = await BranchService.getBranch(token, staff.restaurantId, branchId);
            if (branchResponse.success && branchResponse.data) {
                setBranch(branchResponse.data);
            }
            // Load QR config
            const configResponse = await QRConfigService.getQRConfig(token, staff.restaurantId);
            if (configResponse.success && configResponse.data) {
                const config = configResponse.data;
                setDesignMode(config.designMode);
                setSelectedStyle(config.selectedStyle);
                setSelectedTemplate(config.selectedTemplate);
                setCustomMode(config.customMode);
                setFgColor(config.fgColor);
                setBgColor(config.bgColor);
                setLevel(config.level);
                setSelectedCategory(config.selectedCategory);
                if (config.logoSrc) {
                    setLogoSrc(config.logoSrc);
                    if (config.logoWidth && config.logoHeight) {
                        setLogoDimensions({ width: config.logoWidth, height: config.logoHeight });
                    }
                }
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSaveConfig = async () => {
        if (!staff || !token)
            return;
        setSaving(true);
        setError('');
        setSuccessMessage('');
        try {
            const configData = {
                designMode,
                selectedStyle,
                selectedTemplate,
                customMode,
                fgColor,
                bgColor,
                level,
                selectedCategory,
                logoSrc,
                logoWidth: logoDimensions?.width,
                logoHeight: logoDimensions?.height,
            };
            const response = await QRConfigService.saveQRConfig(token, staff.restaurantId, configData);
            if (response.success) {
                setSuccessMessage('QR design saved successfully! All tables will use this design.');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to save QR config');
        }
        finally {
            setSaving(false);
        }
    };
    const handleResetConfig = async () => {
        if (!staff || !token)
            return;
        if (!window.confirm('Are you sure you want to reset to default QR design?'))
            return;
        setLoading(true);
        setError('');
        try {
            await QRConfigService.resetQRConfig(token, staff.restaurantId);
            loadData();
            setSuccessMessage('QR design reset to defaults successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        catch (err) {
            setError(err.message || 'Failed to reset QR config');
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result;
            setLogoSrc(src);
            const img = new Image();
            img.onload = () => {
                let { naturalWidth: w, naturalHeight: h } = img;
                if (w > h) {
                    h = (h / w) * maxLogoSize;
                    w = maxLogoSize;
                }
                else {
                    w = (w / h) * maxLogoSize;
                    h = maxLogoSize;
                }
                setLogoDimensions({ width: Math.round(w), height: Math.round(h) });
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    };
    const removeLogo = () => {
        setLogoSrc(undefined);
        setLogoDimensions(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const imageSettings = logoSrc && logoDimensions
        ? {
            src: logoSrc,
            width: logoDimensions.width,
            height: logoDimensions.height,
            excavate: true,
        }
        : undefined;
    const stylesArray = getQRStylesArray();
    const initialStyleCount = 6;
    const displayedStyles = showAllStyles ? stylesArray : stylesArray.slice(0, initialStyleCount);
    const hasMoreStyles = stylesArray.length > initialStyleCount;
    const templatesArray = getTemplatesArray();
    const filteredTemplates = selectedCategory === 'all'
        ? templatesArray
        : templatesArray.filter(t => t.config.category === selectedCategory);
    const initialTemplateCount = 6;
    const displayedTemplates = showAllTemplates ? filteredTemplates : filteredTemplates.slice(0, initialTemplateCount);
    const hasMoreTemplates = filteredTemplates.length > initialTemplateCount;
    const currentTemplate = getTemplate(selectedTemplate);
    // Dummy table object for preview
    const dummyTable = {
        _id: 'preview',
        tableNumber: '1',
        restaurantId: staff?.restaurantId || '',
        branchId: branchId || '',
        qrCode: 'preview-qr-code',
        capacity: 4,
        location: 'indoor',
        status: 'available',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    return (_jsxs("div", { className: "qr-management-layout", children: [_jsxs("div", { className: "qr-page-toolbar", children: [_jsxs("h1", { className: "qr-page-title", "data-testid": "qr-management-title", children: ["QR Code Design Manager ", loading ? (_jsx("span", { className: "branch-name-skeleton" })) : (branch && `- ${branch.name}`)] }), _jsxs("div", { className: "qr-toolbar-actions", children: [_jsx(Button, { variant: "outline", onClick: handleResetConfig, size: "sm", children: "Reset" }), _jsx(Button, { variant: "primary", onClick: handleSaveConfig, disabled: saving, "data-testid": "save-qr-config-btn", size: "sm", children: saving ? 'Saving...' : '💾 Save' })] })] }), loading && _jsx(TableManagementSkeleton, {}), error && _jsx("div", { className: "error-banner", children: error }), successMessage && _jsx("div", { className: "success-banner", children: successMessage }), _jsxs("div", { className: "qr-management-content", style: { display: loading ? 'none' : 'flex' }, children: [_jsxs("div", { className: "qr-settings-panel", children: [_jsxs("div", { className: "qr-design-mode-section", children: [_jsx("h3", { className: "qr-section-title", children: "Design Mode" }), _jsxs("div", { className: "qr-design-mode-buttons", children: [_jsxs("button", { className: `qr-design-mode-btn ${designMode === 'simple' ? 'active' : ''}`, onClick: () => setDesignMode('simple'), "data-testid": "design-mode-simple", children: [_jsx("span", { className: "mode-icon", children: "\uD83C\uDFA8" }), _jsxs("div", { children: [_jsx("div", { className: "mode-name", children: "Simple QR" }), _jsx("div", { className: "mode-desc", children: "Quick color styles" })] })] }), _jsxs("button", { className: `qr-design-mode-btn ${designMode === 'template' ? 'active' : ''}`, onClick: () => setDesignMode('template'), "data-testid": "design-mode-template", children: [_jsx("span", { className: "mode-icon", children: "\uD83D\uDCCB" }), _jsxs("div", { children: [_jsx("div", { className: "mode-name", children: "Templates" }), _jsx("div", { className: "mode-desc", children: "Professional designs" })] })] })] })] }), designMode === 'simple' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "qr-mode-toggle", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: customMode, onChange: (e) => setCustomMode(e.target.checked), "data-testid": "custom-mode-toggle" }), ' ', "\uD83C\uDFA8 Custom Design Mode"] }) }), !customMode && (_jsxs("div", { className: "qr-styles-section", children: [_jsx("h3", { className: "qr-section-title", children: "Choose a Style" }), _jsx("div", { className: "qr-styles-grid", children: displayedStyles.map(({ key, config }) => (_jsxs("button", { className: `qr-style-button ${selectedStyle === key ? 'active' : ''}`, onClick: () => setSelectedStyle(key), style: {
                                                        backgroundColor: selectedStyle === key ? config.fgColor : 'white',
                                                        color: selectedStyle === key ? 'white' : '#1e293b',
                                                        borderColor: selectedStyle === key ? config.fgColor : '#e2e8f0',
                                                    }, title: config.description, "data-testid": `style-${key}`, children: [_jsx("span", { className: "qr-style-icon", children: config.icon }), _jsx("span", { className: "qr-style-name", children: config.name })] }, key))) }), hasMoreStyles && (_jsx("button", { className: "qr-view-more-button", onClick: () => setShowAllStyles(!showAllStyles), children: showAllStyles ? (_jsxs(_Fragment, { children: [_jsx("span", { children: "Show Less Themes" }), _jsx("span", { className: "qr-view-more-icon", children: "\u25B2" })] })) : (_jsxs(_Fragment, { children: [_jsxs("span", { children: ["Browse More Themes (", stylesArray.length - initialStyleCount, "+)"] }), _jsx("span", { className: "qr-view-more-icon", children: "\u25BC" })] })) }))] })), customMode && (_jsxs("div", { className: "qr-custom-controls", children: [_jsx("h3", { className: "qr-section-title", children: "Custom Colors" }), _jsxs("div", { className: "qr-form-row", children: [_jsxs("div", { className: "qr-form-field", children: [_jsx("label", { className: "qr-form-label", children: "Pattern Color" }), _jsx("input", { type: "color", value: fgColor, onChange: (e) => setFgColor(e.target.value), className: "qr-color-input", "data-testid": "fg-color-input" })] }), _jsxs("div", { className: "qr-form-field", children: [_jsx("label", { className: "qr-form-label", children: "Background Color" }), _jsx("input", { type: "color", value: bgColor, onChange: (e) => setBgColor(e.target.value), className: "qr-color-input", "data-testid": "bg-color-input" })] })] })] }))] })), designMode === 'template' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "qr-template-categories", children: [_jsx("h3", { className: "qr-section-title", children: "Category" }), _jsx("div", { className: "qr-category-buttons", children: TEMPLATE_CATEGORIES.map(cat => (_jsx("button", { className: `qr-category-btn ${selectedCategory === cat ? 'active' : ''}`, onClick: () => setSelectedCategory(cat), "data-testid": `category-${cat}`, children: cat }, cat))) })] }), _jsxs("div", { className: "qr-templates-section", children: [_jsx("h3", { className: "qr-section-title", children: "Choose Template" }), _jsx("div", { className: "qr-templates-grid", children: displayedTemplates.map(({ key, config }) => (_jsxs("button", { className: `qr-template-button ${selectedTemplate === key ? 'active' : ''}`, onClick: () => setSelectedTemplate(key), "data-testid": `template-${key}`, children: [_jsx("span", { className: "qr-template-icon", children: config.icon }), _jsxs("div", { className: "qr-template-info", children: [_jsx("span", { className: "qr-template-name", children: config.name }), _jsx("span", { className: "qr-template-desc", children: config.description })] })] }, key))) }), hasMoreTemplates && (_jsx("button", { className: "qr-view-more-button", onClick: () => setShowAllTemplates(!showAllTemplates), children: showAllTemplates ? (_jsxs(_Fragment, { children: [_jsx("span", { children: "Show Less" }), _jsx("span", { className: "qr-view-more-icon", children: "\u25B2" })] })) : (_jsxs(_Fragment, { children: [_jsxs("span", { children: ["View More Templates (", filteredTemplates.length - initialTemplateCount, "+)"] }), _jsx("span", { className: "qr-view-more-icon", children: "\u25BC" })] })) }))] })] })), _jsxs("div", { className: "qr-complexity-section", children: [_jsx("h3", { className: "qr-section-title", children: "QR Complexity" }), _jsxs("div", { className: "qr-complexity-grid", children: [_jsxs("button", { className: `qr-complexity-button ${level === 'L' ? 'active' : ''}`, onClick: () => setLevel('L'), "data-testid": "level-L", children: [_jsx("span", { className: "complexity-level", children: "L" }), _jsx("span", { className: "complexity-label", children: "Low" }), _jsx("span", { className: "complexity-percent", children: "7%" })] }), _jsxs("button", { className: `qr-complexity-button ${level === 'M' ? 'active' : ''}`, onClick: () => setLevel('M'), "data-testid": "level-M", children: [_jsx("span", { className: "complexity-level", children: "M" }), _jsx("span", { className: "complexity-label", children: "Medium" }), _jsx("span", { className: "complexity-percent", children: "15%" })] }), _jsxs("button", { className: `qr-complexity-button ${level === 'Q' ? 'active' : ''}`, onClick: () => setLevel('Q'), "data-testid": "level-Q", children: [_jsx("span", { className: "complexity-level", children: "Q" }), _jsx("span", { className: "complexity-label", children: "Quartile" }), _jsx("span", { className: "complexity-percent", children: "25%" })] }), _jsxs("button", { className: `qr-complexity-button ${level === 'H' ? 'active' : ''}`, onClick: () => setLevel('H'), "data-testid": "level-H", children: [_jsx("span", { className: "complexity-level", children: "H" }), _jsx("span", { className: "complexity-label", children: "High" }), _jsx("span", { className: "complexity-percent", children: "30%" })] })] }), _jsx("p", { className: "qr-preview-note", children: "Higher levels allow better recovery if QR code is damaged or has a logo" })] }), designMode === 'simple' && (_jsxs("div", { className: "qr-logo-section", children: [_jsx("h3", { className: "qr-section-title", children: "Center Logo (Optional)" }), _jsx("input", { type: "file", accept: "image/*", ref: fileInputRef, onChange: handleLogoChange, className: "qr-file-input", "data-testid": "logo-upload" }), logoSrc && logoDimensions && (_jsxs("div", { className: "qr-logo-preview", children: [_jsx("img", { src: logoSrc, alt: "Logo preview", className: "qr-logo-preview-image" }), _jsx(Button, { variant: "danger", onClick: removeLogo, children: "Remove Logo" })] })), _jsx("p", { className: "qr-preview-note", children: "Logo scales to ~22% of QR size automatically" })] }))] }), _jsxs("div", { className: "qr-preview-panel", children: [_jsx("div", { className: "qr-preview-display", children: designMode === 'simple' ? (_jsx(QRCodeCanvas, { value: dummyQrUrl, size: qrSize, fgColor: fgColor, bgColor: bgColor, level: level, imageSettings: imageSettings })) : (_jsx(QRTemplateRenderer, { template: currentTemplate, table: dummyTable, qrUrl: dummyQrUrl, qrSettings: { fgColor, bgColor, level }, logoSrc: logoSrc, logoDimensions: logoDimensions })) }), _jsx("p", { className: "qr-preview-hint", children: designMode === 'simple' ? 'Sample QR preview' : 'Print-ready 4" × 6" design preview' })] })] })] }));
};
