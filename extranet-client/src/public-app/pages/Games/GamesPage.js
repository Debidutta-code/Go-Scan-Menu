import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useParams } from 'react-router-dom';
import './GamesPage.css';
export const GamesPage = () => {
    const navigate = useNavigate();
    const { restaurantSlug, branchCode, qrCode } = useParams();
    const getBasePath = () => {
        return qrCode
            ? `/menu/${restaurantSlug}/${branchCode}/${qrCode}`
            : `/menu/${restaurantSlug}/${branchCode}`;
    };
    const games = [
        {
            id: 'memory-game',
            title: 'Memory Game',
            description: 'Test your memory with this classic matching game.',
            icon: '🧠',
            path: `${getBasePath()}/games/memory-game`,
            color: '#805ad5'
        },
        {
            id: 'stack-game',
            title: 'Stack Tower',
            description: 'Stack blocks to build the tallest tower possible!',
            icon: '🏗️',
            path: `${getBasePath()}/games/stack-game`,
            color: '#ed8936'
        },
        {
            id: 'brick-game',
            title: 'Brick Smasher',
            description: 'Classic brick breaking action! Smash them all!',
            icon: '🧱',
            path: `${getBasePath()}/games/brick-game`,
            color: '#47d1ff'
        },
        {
            id: 'finger-pick',
            title: 'Random Finger Pick',
            description: 'Local multiplayer fun! Tap to see who wins.',
            icon: '👆',
            path: `${getBasePath()}/games/finger-pick`,
            color: '#ff4d4d'
        },
        {
            id: 'fastest-finger',
            title: 'Fastest Finger',
            description: '1v1 Tap Battle! Who has the quickest fingers?',
            icon: '⚡',
            path: `${getBasePath()}/games/fastest-finger`,
            color: '#ff0090'
        },
        {
            id: 'rise-up',
            title: 'Rise Up',
            description: 'Protect the balloon at all costs! 4 levels of challenge.',
            icon: '🎈',
            path: `${getBasePath()}/games/rise-up`,
            color: '#00ccff'
        },
        {
            id: 'chidiya-udd',
            title: 'Chidiya Udd',
            description: 'Lift if it flies, stay if it doesn\'t! Classic 2-player reflex game.',
            icon: '🐦',
            path: `${getBasePath()}/games/chidiya-udd`,
            color: '#FFD93D'
        },
        {
            id: 'tic-tac-toe',
            title: 'Tic Tac Toe',
            description: 'Classic 2-player strategy. Top is ✕, Bottom is ○. First to 3 wins!',
            icon: '⊞',
            path: `${getBasePath()}/games/tic-tac-toe`,
            color: '#ff6b6b'
        },
        {
            id: 'galaxy-shooter',
            title: 'Galaxy Shooter',
            description: 'Blast alien waves in deep space! Dodge bullets & survive!',
            icon: '🚀',
            path: `${getBasePath()}/games/galaxy-shooter`,
            color: '#6366f1'
        },
    ];
    return (_jsxs("div", { className: "games-page", children: [_jsxs("header", { className: "games-header", children: [_jsx("h1", { children: "Games" }), _jsx("p", { children: "Take a break and have some fun!" })] }), _jsx("div", { className: "games-grid", children: games.map((game) => (_jsxs("div", { className: "game-card", onClick: () => navigate(game.path), style: { '--accent-color': game.color }, children: [_jsx("div", { className: "game-icon", children: game.icon }), _jsxs("div", { className: "game-info", children: [_jsx("h3", { children: game.title }), _jsx("p", { children: game.description })] }), _jsx("div", { className: "game-arrow", children: "\u2192" })] }, game.id))) })] }));
};
