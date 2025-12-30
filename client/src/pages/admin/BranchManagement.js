import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import './BranchManagement.css';
const BranchManagement = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
    }, []);
    return (_jsxs("div", { className: "branch-management", children: [_jsx(Navbar, { title: "Branch Management", actions: _jsx(Button, { size: "sm", onClick: () => navigate('/admin/dashboard'), children: "Dashboard" }) }), _jsx("div", { className: "branch-management-container container", children: _jsxs(Card, { className: "info-card", children: [_jsx("h2", { children: "\uD83C\uDFE2 Branch Management" }), _jsx("p", { children: "Branch management allows you to manage multiple locations for chain restaurants, configure branch-specific settings, and monitor performance across branches." }), _jsx("p", { className: "note", children: "This feature is available and can be extended based on your requirements." })] }) })] }));
};
export default BranchManagement;
