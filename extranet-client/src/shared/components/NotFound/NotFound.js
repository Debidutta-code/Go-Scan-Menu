import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import './NotFound.css';
const NotFound = () => {
    const navigate = useNavigate();
    const { superAdmin } = useAuth();
    const handleGoHome = () => {
        if (superAdmin) {
            navigate('/dashboard');
        }
        else {
            navigate('/staff/login');
        }
    };
    const handleGoBack = () => {
        navigate(-1);
    };
    return (_jsxs("div", { className: "not-found-container", children: [_jsxs("div", { className: "not-found-background", children: [_jsx("div", { className: "blob blob-1" }), _jsx("div", { className: "blob blob-2" }), _jsx("div", { className: "blob blob-3" })] }), _jsxs(motion.div, { className: "not-found-content", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: "easeOut" }, children: [_jsxs(motion.div, { className: "not-found-icon-wrapper", animate: {
                            y: [0, -20, 0],
                        }, transition: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }, children: [_jsx(Ghost, { size: 120, className: "not-found-icon" }), _jsx("div", { className: "icon-shadow" })] }), _jsx("h1", { className: "not-found-title", children: "404" }), _jsx("h2", { className: "not-found-subtitle", children: "Lost in the Digital Sauce?" }), _jsx("p", { className: "not-found-description", children: "The page you're looking for has vanished into thin air. Don't worry, even the best travelers lose their way sometimes." }), _jsxs("div", { className: "not-found-actions", children: [_jsxs(motion.button, { className: "btn-secondary", onClick: handleGoBack, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(ArrowLeft, { size: 18 }), "Go Back"] }), _jsxs(motion.button, { className: "btn-primary", onClick: handleGoHome, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, children: [_jsx(Home, { size: 18 }), "Home Page"] })] })] }), _jsx("div", { className: "not-found-footer", children: _jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " Go Scan Menu. All rights reserved."] }) })] }));
};
export default NotFound;
