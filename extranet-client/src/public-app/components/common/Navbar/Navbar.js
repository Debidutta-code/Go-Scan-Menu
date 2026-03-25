import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Navbar.css';
export const Navbar = ({ restaurant, table }) => {
    return (_jsx("nav", { className: "pub-nav-container", children: _jsxs("div", { className: "pub-nav-content", children: [_jsxs("div", { className: "pub-nav-left", children: [restaurant.logo && (_jsx("img", { src: restaurant.logo, alt: restaurant.name, className: "pub-nav-logo" })), _jsx("div", { className: "pub-nav-details", children: _jsx("h1", { className: "pub-nav-name", children: restaurant.name }) })] }), table && (_jsx("div", { className: "pub-nav-right", children: _jsxs("div", { className: "pub-nav-table-badge", children: [_jsx("span", { className: "pub-nav-table-label", children: "Table" }), _jsx("span", { className: "pub-nav-table-number", children: table.tableNumber })] }) }))] }) }));
};
