import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/common/Modal.tsx
import { useEffect } from 'react';
import './styles/Modal.css';
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', closeOnOverlayClick = true, closeOnEscape = true, showCloseButton = true, }) => {
    useEffect(() => {
        if (!isOpen)
            return;
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        const handleEscape = (e) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeOnEscape, onClose]);
    if (!isOpen)
        return null;
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };
    const modalClasses = ['modal-content', `modal-${size}`].filter(Boolean).join(' ');
    return (_jsx("div", { className: "modal-overlay", onClick: handleOverlayClick, children: _jsxs("div", { className: modalClasses, role: "dialog", "aria-modal": "true", children: [(title || showCloseButton) && (_jsxs("div", { className: "modal-header", children: [title && _jsx("h2", { className: "modal-title", children: title }), showCloseButton && (_jsx("button", { type: "button", className: "modal-close", onClick: onClose, "aria-label": "Close modal", children: _jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), _jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] }) }))] })), _jsx("div", { className: "modal-body", children: children }), footer && _jsx("div", { className: "modal-footer", children: footer })] }) }));
};
