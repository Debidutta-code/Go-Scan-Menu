import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/QRCodeModal.tsx
import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { QRConfigService } from '@/modules/table/services/qrconfig.service';
import { Button } from '@/shared/components/Button';
import { QR_STYLES } from '@/shared/config/qrStyles.config';
import { getTemplate } from '@/shared/config/qrTemplates.config';
import { QRTemplateRenderer } from './QRTemplateRenderer';
import './QRCodeModal.css';
export const QRCodeModal = ({ table, onClose }) => {
    const { staff, token } = useStaffAuth();
    const [qrUrl, setQrUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qrConfig, setQrConfig] = useState(null);
    const qrRef = useRef(null);
    const qrSize = 300;
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        if (!staff || !token)
            return;
        setLoading(true);
        setError('');
        try {
            const qrResponse = await TableService.getQRCodeData(token, staff.restaurantId, table._id);
            if (qrResponse.success && qrResponse.data?.qrUrl) {
                setQrUrl(qrResponse.data.qrUrl);
            }
            const configResponse = await QRConfigService.getQRConfig(token, staff.restaurantId);
            if (configResponse.success && configResponse.data) {
                setQrConfig(configResponse.data);
            }
            else {
                setQrConfig({
                    restaurantId: staff.restaurantId || '',
                    designMode: 'simple',
                    selectedStyle: 'classic',
                    selectedTemplate: 'classic_tent',
                    customMode: false,
                    fgColor: '#000000',
                    bgColor: '#ffffff',
                    level: 'H',
                    selectedCategory: 'all',
                    isActive: true,
                });
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load QR code');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDownloadQR = () => {
        if (!qrConfig)
            return;
        if (qrConfig.designMode === 'simple') {
            const canvas = qrRef.current?.querySelector('canvas');
            if (!canvas)
                return;
            const link = document.createElement('a');
            link.download = `table-${table.tableNumber}-qr.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
        else {
            const canvas = document.querySelector('.qr-template-canvas');
            if (!canvas) {
                console.error('Template canvas not found');
                return;
            }
            const link = document.createElement('a');
            link.download = `table-${table.tableNumber}-qr.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }
    };
    if (loading) {
        return (_jsx("div", { className: "qr-code-modal-component-overlay", onClick: onClose, children: _jsxs("div", { className: "qr-code-modal-component-content", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "qr-code-modal-component-header", children: [_jsxs("h2", { className: "qr-code-modal-component-title", children: ["QR Code \u2013 Table ", table.tableNumber] }), _jsx("button", { className: "qr-code-modal-component-close", onClick: onClose, children: "\u00D7" })] }), _jsx("div", { className: "qr-code-modal-component-body", children: _jsx("div", { className: "qr-code-modal-component-loading", children: "Loading QR code..." }) })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "qr-code-modal-component-overlay", onClick: onClose, children: _jsxs("div", { className: "qr-code-modal-component-content", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "qr-code-modal-component-header", children: [_jsxs("h2", { className: "qr-code-modal-component-title", children: ["QR Code \u2013 Table ", table.tableNumber] }), _jsx("button", { className: "qr-code-modal-component-close", onClick: onClose, children: "\u00D7" })] }), _jsx("div", { className: "qr-code-modal-component-body", children: _jsx("div", { className: "qr-code-modal-component-error", children: error }) })] }) }));
    }
    if (!qrConfig)
        return null;
    const imageSettings = qrConfig.logoSrc && qrConfig.logoWidth && qrConfig.logoHeight
        ? {
            src: qrConfig.logoSrc,
            width: qrConfig.logoWidth,
            height: qrConfig.logoHeight,
            excavate: true,
        }
        : undefined;
    const currentTemplate = qrConfig.designMode === 'template' ? getTemplate(qrConfig.selectedTemplate) : null;
    const currentStyle = qrConfig.designMode === 'simple' ? QR_STYLES[qrConfig.selectedStyle] : null;
    return (_jsx("div", { className: "qr-code-modal-component-overlay", onClick: onClose, children: _jsxs("div", { className: "qr-code-modal-component-content qr-preview-only", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "qr-code-modal-component-header", children: [_jsxs("h2", { className: "qr-code-modal-component-title", children: ["QR Code \u2013 Table ", table.tableNumber] }), _jsx("button", { className: "qr-code-modal-component-close", onClick: onClose, children: "\u00D7" })] }), _jsx("div", { className: "qr-code-modal-component-body", children: _jsxs("div", { className: "qr-preview-simple-layout", children: [_jsxs("div", { className: "qr-display-section", children: [_jsx("div", { className: "qr-code-display-centered", children: qrConfig.designMode === 'simple' ? (_jsx("div", { ref: qrRef, children: _jsx(QRCodeCanvas, { value: qrUrl, size: qrSize, fgColor: qrConfig.fgColor, bgColor: qrConfig.bgColor, level: qrConfig.level, imageSettings: imageSettings }) })) : currentTemplate ? (_jsx(QRTemplateRenderer, { template: currentTemplate, table: table, qrUrl: qrUrl, qrSettings: {
                                                fgColor: qrConfig.fgColor,
                                                bgColor: qrConfig.bgColor,
                                                level: qrConfig.level,
                                            }, logoSrc: qrConfig.logoSrc, logoDimensions: qrConfig.logoWidth && qrConfig.logoHeight
                                                ? { width: qrConfig.logoWidth, height: qrConfig.logoHeight }
                                                : undefined })) : null }), _jsx("p", { className: "qr-preview-hint", children: qrConfig.designMode === 'simple' ? 'Scan to view menu' : 'Print-ready design' })] }), _jsxs("div", { className: "qr-info-section", children: [_jsxs("div", { className: "qr-info-card", children: [_jsxs("div", { className: "qr-info-row", children: [_jsx("span", { className: "qr-info-label", children: "Design Style:" }), _jsx("span", { className: "qr-info-value", children: qrConfig.designMode === 'simple'
                                                            ? qrConfig.customMode
                                                                ? '🎨 Custom'
                                                                : currentStyle?.name || 'Classic'
                                                            : currentTemplate?.name || 'Classic' })] }), _jsxs("div", { className: "qr-info-row", children: [_jsx("span", { className: "qr-info-label", children: "Error Correction:" }), _jsx("span", { className: "qr-info-value", children: qrConfig.level })] }), _jsxs("div", { className: "qr-info-row", children: [_jsx("span", { className: "qr-info-label", children: "Table:" }), _jsxs("span", { className: "qr-info-value", children: ["#", table.tableNumber] })] })] }), _jsxs("div", { className: "qr-url-section", children: [_jsx("label", { className: "qr-url-label", children: "QR URL:" }), _jsxs("div", { className: "qr-url-input-group", children: [_jsx("input", { className: "qr-url-input", value: qrUrl, readOnly: true }), _jsx(Button, { variant: "outline", onClick: () => {
                                                            navigator.clipboard.writeText(qrUrl);
                                                            alert('URL copied to clipboard!');
                                                        }, children: "Copy" })] })] })] })] }) }), _jsxs("div", { className: "qr-modal-footer", children: [_jsx(Button, { variant: "primary", onClick: handleDownloadQR, children: "\uD83D\uDCE5 Download QR Code" }), _jsx(Button, { variant: "outline", onClick: onClose, children: "Close" })] })] }) }));
};
