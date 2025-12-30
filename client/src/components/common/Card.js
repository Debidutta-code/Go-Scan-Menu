import { jsx as _jsx } from "react/jsx-runtime";
import './styles/Card.css';
export const Card = ({ children, className = '', variant = 'default', padding = 'md', hoverable = false, clickable = false, onClick, }) => {
    const cardClasses = [
        'card',
        `card-${variant}`,
        `card-padding-${padding}`,
        hoverable && 'card-hoverable',
        clickable && 'card-clickable',
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsx("div", { className: cardClasses, onClick: onClick, children: children }));
};
export const CardHeader = ({ children, className = '' }) => {
    return _jsx("div", { className: `card-header ${className}`.trim(), children: children });
};
export const CardBody = ({ children, className = '' }) => {
    return _jsx("div", { className: `card-body ${className}`.trim(), children: children });
};
export const CardFooter = ({ children, className = '' }) => {
    return _jsx("div", { className: `card-footer ${className}`.trim(), children: children });
};
