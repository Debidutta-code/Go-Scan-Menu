import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/BulkCreateTableModal.tsx
import { useState } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import './QRCodeModal.css';
export const BulkCreateTableModal = ({ branchId, onClose, onSuccess, }) => {
    const { staff, token } = useStaffAuth();
    const [formData, setFormData] = useState({
        prefix: '',
        startNumber: 1,
        endNumber: 10,
        capacity: 4,
        location: 'indoor',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!staff || !token)
            return;
        if (formData.startNumber > formData.endNumber) {
            setError('Start number must be less than or equal to end number');
            return;
        }
        if (formData.endNumber - formData.startNumber > 100) {
            setError('Cannot create more than 100 tables at once');
            return;
        }
        if (formData.capacity < 1) {
            setError('Capacity must be at least 1');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await TableService.createBulkTables(token, staff.restaurantId, branchId, formData);
            if (response.success) {
                alert(response.message || 'Tables created successfully');
                onSuccess();
            }
        }
        catch (err) {
            setError(err.message || 'Failed to create tables');
            setLoading(false);
        }
    };
    const getPreview = () => {
        const count = formData.endNumber - formData.startNumber + 1;
        const examples = [];
        for (let i = formData.startNumber; i <= Math.min(formData.startNumber + 2, formData.endNumber); i++) {
            examples.push(`${formData.prefix}${i}`);
        }
        if (count > 3) {
            examples.push('...');
            examples.push(`${formData.prefix}${formData.endNumber}`);
        }
        return { count, examples: examples.join(', ') };
    };
    const preview = getPreview();
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, "data-testid": "bulk-create-modal", children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { className: "modal-title", children: "Bulk Create Tables" }), _jsx("button", { className: "modal-close", onClick: onClose, "data-testid": "close-modal", children: "\u00D7" })] }), _jsx("div", { className: "modal-body", children: _jsxs("form", { onSubmit: handleSubmit, className: "table-form", children: [error && _jsx("div", { className: "error-banner", children: error }), _jsx(InputField, { label: "Table Number Prefix (optional)", type: "text", value: formData.prefix, onChange: (e) => setFormData({ ...formData, prefix: e.target.value }), placeholder: "e.g., T-, A, Table-", "data-testid": "prefix-input" }), _jsxs("div", { className: "form-row", children: [_jsx(InputField, { label: "Start Number", type: "number", value: formData.startNumber, onChange: (e) => setFormData({ ...formData, startNumber: parseInt(e.target.value) || 1 }), min: 1, required: true, "data-testid": "start-number-input" }), _jsx(InputField, { label: "End Number", type: "number", value: formData.endNumber, onChange: (e) => setFormData({ ...formData, endNumber: parseInt(e.target.value) || 1 }), min: formData.startNumber, required: true, "data-testid": "end-number-input" })] }), _jsx(InputField, { label: "Capacity (number of seats)", type: "number", value: formData.capacity, onChange: (e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 }), min: 1, required: true, "data-testid": "capacity-input" }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "form-label", children: "Location" }), _jsxs("select", { className: "form-select", value: formData.location, onChange: (e) => setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        }), "data-testid": "location-select", children: [_jsx("option", { value: "indoor", children: "Indoor" }), _jsx("option", { value: "outdoor", children: "Outdoor" }), _jsx("option", { value: "balcony", children: "Balcony" }), _jsx("option", { value: "rooftop", children: "Rooftop" }), _jsx("option", { value: "private room", children: "Private Room" })] })] }), _jsxs("div", { className: "preview-section", children: [_jsx("h3", { className: "preview-title", children: "Preview:" }), _jsxs("p", { className: "preview-text", children: [_jsx("strong", { children: preview.count }), " tables will be created:"] }), _jsx("p", { className: "preview-examples", children: preview.examples })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, "data-testid": "cancel-button", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading, "data-testid": "submit-button", children: loading ? 'Creating...' : `Create ${preview.count} Tables` })] })] }) })] }) }));
};
