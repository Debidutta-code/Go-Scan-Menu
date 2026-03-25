import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const CategoryItem = ({ icon, label, active, badge, onClick }) => (_jsxs("div", { className: `settings-cat-item ${active ? 'active' : ''}`, onClick: onClick, children: [_jsx("div", { className: "cat-icon", children: icon }), _jsx("span", { className: "cat-label", children: label }), badge && _jsx("span", { className: "cat-badge", children: badge })] }));
export default CategoryItem;
