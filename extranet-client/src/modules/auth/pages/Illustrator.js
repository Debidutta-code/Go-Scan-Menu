import { jsx as _jsx } from "react/jsx-runtime";
import { ILLUSTRATION_URL } from '@/shared/constants/auth/auth';
const Illustrator = () => {
    return (
    // {/* Left side: Illustration */}
    _jsx("div", { className: "login-illustration-side", children: _jsx("img", { src: ILLUSTRATION_URL, alt: "Customer scanning QR code menu on phone with waiter", className: "login-illustration" }) }));
};
export default Illustrator;
