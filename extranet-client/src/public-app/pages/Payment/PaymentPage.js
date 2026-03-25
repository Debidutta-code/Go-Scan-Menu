import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import './PaymentPage.css';
export const PaymentPage = () => {
    const { menuData } = usePublicApp();
    return (_jsx("div", { className: "payment-page-wrapper", children: _jsxs("div", { className: "payment-container", children: [_jsx("h2", { children: "Hello World" }), _jsxs("p", { children: ["Restaurant: ", menuData.restaurant.name] })] }) }));
};
