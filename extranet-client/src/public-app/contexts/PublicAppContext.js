import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const PublicAppContext = createContext(null);
export const PublicAppProvider = ({ children, value }) => {
    return (_jsx(PublicAppContext.Provider, { value: value, children: children }));
};
export const usePublicApp = () => {
    const context = useContext(PublicAppContext);
    if (!context) {
        throw new Error('usePublicApp must be used within PublicAppProvider');
    }
    return context;
};
