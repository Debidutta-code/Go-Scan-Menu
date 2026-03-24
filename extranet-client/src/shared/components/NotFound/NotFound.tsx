import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import './NotFound.css';

const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const { superAdmin } = useAuth();

    const handleGoHome = () => {
        if (superAdmin) {
            navigate('/dashboard');
        } else {
            navigate('/staff/login');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="not-found-container">
            <div className="not-found-background">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <motion.div
                className="not-found-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.div
                    className="not-found-icon-wrapper"
                    animate={{
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Ghost size={120} className="not-found-icon" />
                    <div className="icon-shadow"></div>
                </motion.div>

                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Lost in the Digital Sauce?</h2>
                <p className="not-found-description">
                    The page you're looking for has vanished into thin air.
                    Don't worry, even the best travelers lose their way sometimes.
                </p>

                <div className="not-found-actions">
                    <motion.button
                        className="btn-secondary"
                        onClick={handleGoBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </motion.button>

                    <motion.button
                        className="btn-primary"
                        onClick={handleGoHome}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Home size={18} />
                        Home Page
                    </motion.button>
                </div>
            </motion.div>

            <div className="not-found-footer">
                <p>© {new Date().getFullYear()} Go Scan Menu. All rights reserved.</p>
            </div>
        </div>
    );
};

export default NotFound;
