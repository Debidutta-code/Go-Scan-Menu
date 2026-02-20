import React, { useState, useEffect, useRef } from 'react';
import './FastestFingerGame.css';

type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'RESULT';

export const FastestFingerGame: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [countdown, setCountdown] = useState(3);
    const [gameTimer, setGameTimer] = useState(10);
    const [scores, setScores] = useState({ top: 0, bottom: 0 });

    const timerRef = useRef<any>(null);

    const startGame = () => {
        setScores({ top: 0, bottom: 0 });
        setGameState('COUNTDOWN');
        setCountdown(3);
    };

    useEffect(() => {
        if (gameState === 'COUNTDOWN') {
            if (countdown > 0) {
                timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
            } else {
                setGameState('PLAYING');
                setGameTimer(10);
            }
        } else if (gameState === 'PLAYING') {
            if (gameTimer > 0) {
                timerRef.current = setTimeout(() => setGameTimer((prev) => parseFloat((prev - 0.1).toFixed(1))), 100);
            } else {
                setGameState('RESULT');
            }
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [gameState, countdown, gameTimer]);

    const handleTap = (player: 'top' | 'bottom') => {
        if (gameState !== 'PLAYING') return;
        setScores((prev) => ({
            ...prev,
            [player]: prev[player] + 1,
        }));
    };

    const getWinner = () => {
        if (scores.top > scores.bottom) return 'TOP PLAYER WINS!';
        if (scores.bottom > scores.top) return 'BOTTOM PLAYER WINS!';
        return "IT'S A DRAW!";
    };

    return (
        <div className="fastest-finger-container">
            {/* Top Player Section */}
            <div
                className={`player-section top-player ${gameState === 'PLAYING' ? 'active' : ''}`}
                onClick={() => handleTap('top')}
            >
                <div className="score-display rotated">{scores.top}</div>
                <div className="tap-hint rotated">{gameState === 'PLAYING' ? 'TAP TAP TAP!' : ''}</div>
            </div>

            {/* Middle Overlay UI */}
            <div className="middle-ui">
                {gameState === 'IDLE' && (
                    <div className="overlay-content">
                        <h1>FASTEST FINGER</h1>
                        <p>1v1 Tap Battle</p>
                        <button className="start-btn" onClick={startGame}>START BATTLE</button>
                    </div>
                )}

                {gameState === 'COUNTDOWN' && (
                    <div className="countdown-number">{countdown > 0 ? countdown : 'GO!'}</div>
                )}

                {gameState === 'PLAYING' && (
                    <div className="game-timer">
                        <div className="timer-bar" style={{ width: `${(gameTimer / 10) * 100}%` }}></div>
                        <span className="timer-text">{gameTimer.toFixed(1)}s</span>
                    </div>
                )}

                {gameState === 'RESULT' && (
                    <div className="result-overlay">
                        <h2 className="winner-text">{getWinner()}</h2>
                        <div className="final-scores">
                            <div className="score-item rotated">
                                <span>TOP</span>
                                <strong>{scores.top}</strong>
                            </div>
                            <div className="score-item">
                                <span>BOTTOM</span>
                                <strong>{scores.bottom}</strong>
                            </div>
                        </div>
                        <button className="reset-btn" onClick={startGame}>REMATCH</button>
                    </div>
                )}
            </div>

            {/* Bottom Player Section */}
            <div
                className={`player-section bottom-player ${gameState === 'PLAYING' ? 'active' : ''}`}
                onClick={() => handleTap('bottom')}
            >
                <div className="score-display">{scores.bottom}</div>
                <div className="tap-hint">{gameState === 'PLAYING' ? 'TAP TAP TAP!' : ''}</div>
            </div>

            <div className="scanlines"></div>
        </div>
    );
};
