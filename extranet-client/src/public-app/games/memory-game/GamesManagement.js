import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GamesManagement.css';
const GAME_ICONS = ['💍', '📜', '🔮', '⚔️', '🛡️', '🧪', '💎', '🔑'];
export const GamesManagement = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    // Initialize game
    const initializeGame = useCallback(() => {
        const duplicatedIcons = [...GAME_ICONS, ...GAME_ICONS];
        const shuffledIcons = duplicatedIcons.sort(() => Math.random() - 0.5);
        const newCards = shuffledIcons.map((icon, index) => ({
            id: index,
            icon,
            isFlipped: false,
            isMatched: false,
        }));
        setCards(newCards);
        setFlippedCards([]);
        setMoves(0);
        setSeconds(0);
        setIsActive(false);
        setIsGameOver(false);
    }, []);
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);
    // Timer logic
    useEffect(() => {
        let interval;
        if (isActive && !isGameOver) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isGameOver]);
    const handleCardClick = (id) => {
        if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || isGameOver)
            return;
        if (!isActive)
            setIsActive(true);
        const newCards = cards.map(card => card.id === id ? { ...card, isFlipped: true } : card);
        setCards(newCards);
        const newFlippedCards = [...flippedCards, id];
        setFlippedCards(newFlippedCards);
        if (newFlippedCards.length === 2) {
            setMoves(m => m + 1);
            checkForMatch(newFlippedCards, newCards);
        }
    };
    const checkForMatch = (currentFlipped, currentCards) => {
        const [id1, id2] = currentFlipped;
        if (currentCards[id1].icon === currentCards[id2].icon) {
            setTimeout(() => {
                setCards(prev => prev.map(card => (card.id === id1 || card.id === id2)
                    ? { ...card, isMatched: true, isFlipped: true }
                    : card));
                setFlippedCards([]);
                // Check win condition using functional update to ensure latest state
                setCards(latestCards => {
                    if (latestCards.every(card => card.isMatched)) {
                        setIsGameOver(true);
                        setIsActive(false);
                    }
                    return latestCards;
                });
            }, 500);
        }
        else {
            setTimeout(() => {
                setCards(prev => prev.map(card => (card.id === id1 || card.id === id2)
                    ? { ...card, isFlipped: false }
                    : card));
                setFlippedCards([]);
            }, 1000);
        }
    };
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (_jsx("div", { className: "memory-game-container", children: _jsxs("div", { className: "game-wrapper", children: [_jsxs("header", { className: "game-header-advanced", children: [_jsxs("div", { className: "game-nav", children: [_jsx("button", { className: "glass-btn back-btn", onClick: () => navigate(-1), children: _jsx("span", { className: "btn-icon", children: "\u2190" }) }), _jsx("h1", { className: "game-title", children: "Relic Match" }), _jsx("button", { className: "glass-btn reset-btn", onClick: initializeGame, children: _jsx("span", { className: "btn-icon", children: "\u21BB" }) })] }), _jsxs("div", { className: "game-stats-bar", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "TIME" }), _jsx("span", { className: "stat-value", children: formatTime(seconds) })] }), _jsx("div", { className: "stat-divider" }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "MOVES" }), _jsx("span", { className: "stat-value", children: moves })] })] })] }), _jsx("div", { className: "memory-grid-advanced", children: cards.map((card) => (_jsxs("div", { className: `memory-card-advanced ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`, onClick: () => handleCardClick(card.id), children: [_jsxs("div", { className: "card-face card-front", children: [_jsxs("div", { className: "hexagon-container", children: [_jsx("div", { className: "hexagon" }), _jsx("div", { className: "hexagon-inner" })] }), _jsx("div", { className: "card-texture" })] }), _jsx("div", { className: "card-face card-back", children: _jsxs("div", { className: "icon-wrapper", children: [_jsx("span", { className: "card-icon-main", children: card.icon }), _jsx("div", { className: "icon-glow" })] }) })] }, card.id))) }), isGameOver && (_jsx("div", { className: "win-modal-overlay", children: _jsxs("div", { className: "win-modal", children: [_jsx("div", { className: "win-trophy", children: "\uD83C\uDFC6" }), _jsx("h2", { children: "Victory!" }), _jsxs("div", { className: "win-stats", children: [_jsxs("div", { className: "win-stat", children: [_jsx("span", { children: "Time" }), _jsx("strong", { children: formatTime(seconds) })] }), _jsxs("div", { className: "win-stat", children: [_jsx("span", { children: "Moves" }), _jsx("strong", { children: moves })] })] }), _jsx("button", { className: "play-again-btn", onClick: initializeGame, children: "Play Again" })] }) }))] }) }));
};
