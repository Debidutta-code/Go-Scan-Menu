import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import './StaffLayout.css';

export const StaffLayout: React.FC = () => {
    const { refreshAuth } = useStaffAuth();

    useEffect(() => {
        refreshAuth();
    }, []);

    return (
        <div className="staff-layout">
            <main className="staff-main-content">
                <Outlet />
            </main>
        </div>
    );
};
