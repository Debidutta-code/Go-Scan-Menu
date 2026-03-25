import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const PageHeaderContext = createContext(undefined);
export const PageHeaderProvider = ({ children }) => {
    const [state, setState] = useState({
        title: '',
        breadcrumbs: [],
        actions: null,
    });
    const setPageHeader = (newState) => {
        setState((prev) => ({ ...prev, ...newState }));
    };
    const resetPageHeader = () => {
        setState({
            title: '',
            breadcrumbs: [],
            actions: null,
        });
    };
    return (_jsx(PageHeaderContext.Provider, { value: { ...state, setPageHeader, resetPageHeader }, children: children }));
};
export const usePageHeaderContext = () => {
    const context = useContext(PageHeaderContext);
    if (!context) {
        throw new Error('usePageHeaderContext must be used within a PageHeaderProvider');
    }
    return context;
};
// Helper hook for pages to easily set header
export const usePageHeader = (title, breadcrumbs = [], actions = null) => {
    const { setPageHeader, resetPageHeader } = usePageHeaderContext();
    useEffect(() => {
        setPageHeader({ title, breadcrumbs, actions });
        return () => {
            resetPageHeader();
        };
    }, [title, actions]); // Deep comparison for breadcrumbs/actions might be needed if they change frequently, but component reference usually stable
};
