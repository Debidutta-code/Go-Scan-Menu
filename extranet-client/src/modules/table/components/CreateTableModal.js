import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/CreateTableModal.tsx
import { useState } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import './QRCodeModal.css';
export const CreateTableModal = ({ branchId, onClose, onSuccess, }) => {
    const { staff, token } = useStaffAuth();
    const [formData, setFormData] = useState({
        tableNumber: '',
        capacity: 4,
        location: 'indoor',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!staff || !token)
            return;
        if (!formData.tableNumber.trim()) {
            setError('Table number is required');
            return;
        }
        if (formData.capacity < 1) {
            setError('Capacity must be at least 1');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await TableService.createTable(token, staff.restaurantId, branchId, formData);
            if (response.success) {
                alert('Table created successfully');
                onSuccess();
            }
        }
        catch (err) {
            setError(err.message || 'Failed to create table');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, "data-testid": "create-table-modal", children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h2", { className: "modal-title", children: "Create New Table" }), _jsx("button", { className: "modal-close", onClick: onClose, "data-testid": "close-modal", children: "\u00D7" })] }), _jsx("div", { className: "modal-body", children: _jsxs("form", { onSubmit: handleSubmit, className: "table-form", children: [error && _jsx("div", { className: "error-banner", children: error }), _jsx(InputField, { label: "Table Number", type: "text", value: formData.tableNumber, onChange: (e) => setFormData({ ...formData, tableNumber: e.target.value }), placeholder: "e.g., 1, A1, T-101", required: true, "data-testid": "table-number-input" }), _jsx(InputField, { label: "Capacity (number of seats)", type: "number", value: formData.capacity, onChange: (e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 }), min: 1, required: true, "data-testid": "capacity-input" }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "form-label", children: "Location" }), _jsxs("select", { className: "form-select", value: formData.location, onChange: (e) => setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        }), "data-testid": "location-select", children: [_jsx("option", { value: "indoor", children: "Indoor" }), _jsx("option", { value: "outdoor", children: "Outdoor" }), _jsx("option", { value: "balcony", children: "Balcony" }), _jsx("option", { value: "rooftop", children: "Rooftop" }), _jsx("option", { value: "private room", children: "Private Room" })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, "data-testid": "cancel-button", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading, "data-testid": "submit-button", children: loading ? 'Creating...' : 'Create Table' })] })] }) })] }) }));
};
