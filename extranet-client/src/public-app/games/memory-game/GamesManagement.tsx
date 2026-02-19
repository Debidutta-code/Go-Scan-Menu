import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GamesManagement.css';

interface Card {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const GAME_ICONS = ['💍', '📜', '🔮', '⚔️', '🛡️', '🧪', '💎', '🔑'];

export const GamesManagement: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
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
        let interval: any;
        if (isActive && !isGameOver) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isGameOver]);

    const handleCardClick = (id: number) => {
        if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || isGameOver) return;

        if (!isActive) setIsActive(true);

        const newCards = cards.map(card =>
            card.id === id ? { ...card, isFlipped: true } : card
        );
        setCards(newCards);

        const newFlippedCards = [...flippedCards, id];
        setFlippedCards(newFlippedCards);

        if (newFlippedCards.length === 2) {
            setMoves(m => m + 1);
            checkForMatch(newFlippedCards, newCards);
        }
    };

    const checkForMatch = (currentFlipped: number[], currentCards: Card[]) => {
        const [id1, id2] = currentFlipped;

        if (currentCards[id1].icon === currentCards[id2].icon) {
            setTimeout(() => {
                setCards(prev => prev.map(card =>
                    (card.id === id1 || card.id === id2)
                        ? { ...card, isMatched: true, isFlipped: true }
                        : card
                ));
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
        } else {
            setTimeout(() => {
                setCards(prev => prev.map(card =>
                    (card.id === id1 || card.id === id2)
                        ? { ...card, isFlipped: false }
                        : card
                ));
                setFlippedCards([]);
            }, 1000);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="memory-game-container">
            <div className="game-wrapper">
                <header className="game-header-advanced">
                    <div className="game-nav">
                        <button className="glass-btn back-btn" onClick={() => navigate(-1)}>
                            <span className="btn-icon">←</span>
                        </button>
                        <h1 className="game-title">Relic Match</h1>
                        <button className="glass-btn reset-btn" onClick={initializeGame}>
                            <span className="btn-icon">↻</span>
                        </button>
                    </div>

                    <div className="game-stats-bar">
                        <div className="stat-item">
                            <span className="stat-label">TIME</span>
                            <span className="stat-value">{formatTime(seconds)}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-label">MOVES</span>
                            <span className="stat-value">{moves}</span>
                        </div>
                    </div>
                </header>

                <div className="memory-grid-advanced">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className={`memory-card-advanced ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                            onClick={() => handleCardClick(card.id)}
                        >
                            <div className="card-face card-front">
                                <div className="hexagon-container">
                                    <div className="hexagon"></div>
                                    <div className="hexagon-inner"></div>
                                </div>
                                <div className="card-texture"></div>
                            </div>
                            <div className="card-face card-back">
                                <div className="icon-wrapper">
                                    <span className="card-icon-main">{card.icon}</span>
                                    <div className="icon-glow"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isGameOver && (
                    <div className="win-modal-overlay">
                        <div className="win-modal">
                            <div className="win-trophy">🏆</div>
                            <h2>Victory!</h2>
                            <div className="win-stats">
                                <div className="win-stat">
                                    <span>Time</span>
                                    <strong>{formatTime(seconds)}</strong>
                                </div>
                                <div className="win-stat">
                                    <span>Moves</span>
                                    <strong>{moves}</strong>
                                </div>
                            </div>
                            <button className="play-again-btn" onClick={initializeGame}>
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
