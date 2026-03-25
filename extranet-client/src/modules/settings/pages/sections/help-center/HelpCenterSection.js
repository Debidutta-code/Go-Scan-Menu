import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HelpCircle, MessageSquare, Book, Mail, ExternalLink, ChevronDown } from 'lucide-react';
const HelpCenterSection = () => {
    const faqs = [
        {
            question: "How do I update my branch information?",
            answer: "You can update branch details by navigating to the Branch Management section or contacting your administrator."
        },
        {
            question: "How do I process a refund?",
            answer: "Refunds can be processed through the Order History section. Select the order and click on the 'Process Refund' button."
        },
        {
            question: "Can I customize the menu display?",
            answer: "Yes, menu customization options are available in the Printer & Menu settings under the Preferences tab."
        }
    ];
    return (_jsxs("div", { className: "settings-section", children: [_jsxs("div", { className: "help-center-header", children: [_jsx("h2", { className: "section-title", children: "Help Center" }), _jsx("p", { className: "section-description", children: "Find answers to common questions and get support." })] }), _jsxs("div", { className: "settings-sub-section", children: [_jsxs("h3", { className: "sub-section-title", children: [_jsx(Book, { size: 18, className: "mr-2" }), "Frequently Asked Questions"] }), _jsx("div", { className: "faq-list", children: faqs.map((faq, index) => (_jsx("div", { className: "faq-item", children: _jsxs("details", { children: [_jsxs("summary", { className: "faq-question", children: [faq.question, _jsx(ChevronDown, { size: 16, className: "chevron" })] }), _jsx("div", { className: "faq-answer", children: faq.answer })] }) }, index))) })] }), _jsxs("div", { className: "settings-sub-section", children: [_jsxs("h3", { className: "sub-section-title", children: [_jsx(MessageSquare, { size: 18, className: "mr-2" }), "Contact Support"] }), _jsxs("div", { className: "contact-cards", children: [_jsxs("div", { className: "contact-card", children: [_jsx(Mail, { className: "card-icon" }), _jsxs("div", { className: "card-content", children: [_jsx("h4", { children: "Email Support" }), _jsx("p", { children: "Get in touch via email" }), _jsx("a", { href: "mailto:support@goscanmenu.com", className: "contact-link", children: "support@goscanmenu.com" })] })] }), _jsxs("div", { className: "contact-card", children: [_jsx(HelpCircle, { className: "card-icon" }), _jsxs("div", { className: "card-content", children: [_jsx("h4", { children: "Documentation" }), _jsx("p", { children: "Read our full guide" }), _jsxs("a", { href: "#", className: "contact-link", children: ["Open Docs ", _jsx(ExternalLink, { size: 14 })] })] })] })] })] })] }));
};
export default HelpCenterSection;
