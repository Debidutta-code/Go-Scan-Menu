import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BreadcrumbItem } from '../components/ui/Breadcrumb';

interface PageHeaderState {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    actions: ReactNode;
}

interface PageHeaderContextType extends PageHeaderState {
    setPageHeader: (state: Partial<PageHeaderState>) => void;
    resetPageHeader: () => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export const PageHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<PageHeaderState>({
        title: '',
        breadcrumbs: [],
        actions: null,
    });

    const setPageHeader = (newState: Partial<PageHeaderState>) => {
        setState((prev) => ({ ...prev, ...newState }));
    };

    const resetPageHeader = () => {
        setState({
            title: '',
            breadcrumbs: [],
            actions: null,
        });
    };

    return (
        <PageHeaderContext.Provider value={{ ...state, setPageHeader, resetPageHeader }}>
            {children}
        </PageHeaderContext.Provider>
    );
};

export const usePageHeaderContext = () => {
    const context = useContext(PageHeaderContext);
    if (!context) {
        throw new Error('usePageHeaderContext must be used within a PageHeaderProvider');
    }
    return context;
};

// Helper hook for pages to easily set header
export const usePageHeader = (
    title: string,
    breadcrumbs: BreadcrumbItem[] = [],
    actions: ReactNode = null
) => {
    const { setPageHeader, resetPageHeader } = usePageHeaderContext();

    useEffect(() => {
        setPageHeader({ title, breadcrumbs, actions });
        return () => {
            resetPageHeader();
        }
    }, [title, actions]); // Deep comparison for breadcrumbs/actions might be needed if they change frequently, but component reference usually stable
};
