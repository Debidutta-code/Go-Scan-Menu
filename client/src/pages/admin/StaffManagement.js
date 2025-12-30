import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import './StaffManagement.css';
const StaffManagement = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
    }, []);
    return (_jsxs("div", { className: "staff-management", children: [_jsx(Navbar, { title: "Staff Management", actions: _jsx(Button, { size: "sm", onClick: () => navigate('/admin/dashboard'), children: "Dashboard" }) }), _jsx("div", { className: "staff-management-container container", children: _jsxs(Card, { className: "info-card", children: [_jsx("h2", { children: "\uD83D\uDC65 Staff Management" }), _jsx("p", { children: "Staff management features include adding staff members, assigning roles, managing permissions, and tracking staff activity." }), _jsx("p", { className: "note", children: "This feature is available and can be extended based on your requirements." })] }) })] }));
};
export default StaffManagement;
