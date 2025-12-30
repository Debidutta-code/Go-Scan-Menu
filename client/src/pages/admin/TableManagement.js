import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService } from '../../services/restaurant.service';
import { Button, Card, Loader, Modal, Input } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import './TableManagement.css';
const TableManagement = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [tableForm, setTableForm] = useState({
        tableNumber: '',
        capacity: '',
        location: 'indoor',
    });
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchTables();
    }, []);
    const fetchTables = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const fetchedTables = await tableService.getTables(user.restaurantId);
            setTables(fetchedTables);
        }
        catch (error) {
            console.error('Error fetching tables:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddTable = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await tableService.createTable(user.restaurantId, {
                ...tableForm,
                branchId: user.branchId,
                capacity: parseInt(tableForm.capacity),
            });
            setShowAddModal(false);
            setTableForm({ tableNumber: '', capacity: '', location: 'indoor' });
            fetchTables();
        }
        catch (error) {
            console.error('Error adding table:', error);
            alert('Failed to add table');
        }
    };
    const getStatusColor = (status) => {
        const colors = {
            available: 'green',
            occupied: 'red',
            reserved: 'blue',
            maintenance: 'gray',
        };
        return colors[status] || 'gray';
    };
    if (loading) {
        return _jsx(Loader, {});
    }
    return (_jsxs("div", { className: "table-management", children: [_jsx(Navbar, { title: "Table Management", actions: _jsx(Button, { size: "sm", onClick: () => navigate('/admin/dashboard'), children: "Dashboard" }) }), _jsxs("div", { className: "table-management-container container", children: [_jsx("div", { className: "actions-bar", children: _jsx(Button, { onClick: () => setShowAddModal(true), children: "\u2795 Add Table" }) }), _jsx("div", { className: "tables-grid", children: tables.map((table) => (_jsxs(Card, { className: "table-card", children: [_jsx("div", { className: "table-number", children: table.tableNumber }), _jsxs("div", { className: "table-info", children: [_jsxs("div", { className: "info-row", children: [_jsx("span", { children: "\uD83D\uDC65 Capacity:" }), _jsx("span", { children: table.capacity })] }), _jsxs("div", { className: "info-row", children: [_jsx("span", { children: "\uD83D\uDCCD Location:" }), _jsx("span", { children: table.location })] }), _jsxs("div", { className: "info-row", children: [_jsx("span", { children: "Status:" }), _jsx("span", { className: `table-status status-${getStatusColor(table.status)}`, children: table.status })] })] }), _jsx("div", { className: "table-qr", children: _jsxs("small", { children: ["QR: ", table.qrCode] }) })] }, table._id))) }), tables.length === 0 && (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No tables found. Add your first table!" }) }))] }), _jsx(Modal, { isOpen: showAddModal, onClose: () => setShowAddModal(false), title: "Add New Table", size: "md", children: _jsxs("div", { className: "form-modal", children: [_jsx(Input, { label: "Table Number", value: tableForm.tableNumber, onChange: (e) => setTableForm({ ...tableForm, tableNumber: e.target.value }), placeholder: "Enter table number (e.g., T-1)", required: true }), _jsx(Input, { label: "Capacity", type: "number", value: tableForm.capacity, onChange: (e) => setTableForm({ ...tableForm, capacity: e.target.value }), placeholder: "Enter seating capacity", required: true }), _jsxs("div", { className: "input-group", children: [_jsx("label", { className: "input-label", children: "Location" }), _jsxs("select", { className: "input", value: tableForm.location, onChange: (e) => setTableForm({ ...tableForm, location: e.target.value }), children: [_jsx("option", { value: "indoor", children: "Indoor" }), _jsx("option", { value: "outdoor", children: "Outdoor" }), _jsx("option", { value: "balcony", children: "Balcony" }), _jsx("option", { value: "rooftop", children: "Rooftop" }), _jsx("option", { value: "private room", children: "Private Room" })] })] }), _jsxs("div", { className: "modal-actions", children: [_jsx(Button, { variant: "secondary", onClick: () => setShowAddModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleAddTable, children: "Add Table" })] })] }) })] }));
};
export default TableManagement;
