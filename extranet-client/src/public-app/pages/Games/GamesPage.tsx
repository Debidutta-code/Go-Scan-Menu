import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GamesPage.css';

export const GamesPage: React.FC = () => {
    const navigate = useNavigate();
    const { restaurantSlug, branchCode, qrCode } = useParams<{
        restaurantSlug: string;
        branchCode: string;
        qrCode?: string;
    }>();

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
        }
    ];

    return (
        <div className="games-page">
            <header className="games-header">
                <h1>Games</h1>
                <p>Take a break and have some fun!</p>
            </header>

            <div className="games-grid">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className="game-card"
                        onClick={() => navigate(game.path)}
                        style={{ '--accent-color': game.color } as React.CSSProperties}
                    >
                        <div className="game-icon">{game.icon}</div>
                        <div className="game-info">
                            <h3>{game.title}</h3>
                            <p>{game.description}</p>
                        </div>
                        <div className="game-arrow">→</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
