import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FastestFingerGame.css';

type GameState = 'IDLE' | 'COUNTDOWN' | 'GO' | 'PLAYING' | 'RESULT';

interface TapEffect {
    id: number;
    x: number;
    y: number;
    player: 'top' | 'bottom';
}

const GAME_DURATION_MS = 10000;
const TICK_MS = 50;

export const FastestFingerGame: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [countdown, setCountdown] = useState(3);
    const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
    const [scores, setScores] = useState({ top: 0, bottom: 0 });
    const [tapEffects, setTapEffects] = useState<TapEffect[]>([]);
    const [lastScored, setLastScored] = useState<'top' | 'bottom' | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    /* ── Start game ── */
    const startGame = () => {
        clearTimer();
        setScores({ top: 0, bottom: 0 });
        setTapEffects([]);
        setLastScored(null);
        setCountdown(3);
        setTimeLeftMs(GAME_DURATION_MS);
        setGameState('COUNTDOWN');
    };

    /* ── Countdown logic ── */
    useEffect(() => {
        if (gameState !== 'COUNTDOWN') return;
        clearTimer();
        intervalRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearTimer();
                    setGameState('GO');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return clearTimer;
    }, [gameState]);

    /* ── "GO!" flash then start playing ── */
    useEffect(() => {
        if (gameState !== 'GO') return;
        const t = setTimeout(() => {
            setGameState('PLAYING');
            setTimeLeftMs(GAME_DURATION_MS);
        }, 700);
        return () => clearTimeout(t);
    }, [gameState]);

    /* ── Game timer ── */
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        clearTimer();
        intervalRef.current = setInterval(() => {
            setTimeLeftMs(prev => {
                const next = prev - TICK_MS;
                if (next <= 0) {
                    clearTimer();
                    setGameState('RESULT');
                    return 0;
                }
                return next;
            });
        }, TICK_MS);
        return clearTimer;
    }, [gameState]);

    /* ── Tap handler ── */
    const handleTap = useCallback((player: 'top' | 'bottom', x: number, y: number) => {
        if (gameState !== 'PLAYING') return;

        const effect: TapEffect = { id: Date.now() + Math.random(), x, y, player };
        setTapEffects(prev => [...prev, effect]);
        setTimeout(() => setTapEffects(prev => prev.filter(e => e.id !== effect.id)), 500);

        setScores(prev => ({ ...prev, [player]: prev[player] + 1 }));
        setLastScored(player);
    }, [gameState]);

    /* ── Winner logic ── */
    const getWinner = () => {
        if (scores.top > scores.bottom) return { text: 'TOP WINS!', player: 'top' as const };
        if (scores.bottom > scores.top) return { text: 'BOTTOM WINS!', player: 'bottom' as const };
        return { text: "IT'S A DRAW!", player: null };
    };

    const timerPercent = (timeLeftMs / GAME_DURATION_MS) * 100;
    const timerSeconds = (timeLeftMs / 1000).toFixed(1);
    const isPlaying = gameState === 'PLAYING';

    /* ── Who's leading ── */
    const leading = scores.top > scores.bottom ? 'top'
        : scores.bottom > scores.top ? 'bottom' : null;

    return (
        <div className="fastest-finger-container">

            {/* ── Top Player ── */}
            <div
                className={`player-section top-player ${isPlaying ? 'active' : ''} ${leading === 'top' && isPlaying ? 'leading' : ''}`}
                onPointerDown={isPlaying ? (e) => handleTap('top', e.clientX, e.clientY) : undefined}
                style={{ touchAction: 'none' }}
            >
                <div className="player-bg-glow top-glow" />
                <div className={`score-display rotated ${lastScored === 'top' ? 'score-pop' : ''}`}>
                    {scores.top}
                </div>
                {isPlaying && <div className="tap-hint rotated">TAP TAP TAP!</div>}
                {isPlaying && leading === 'top' && (
                    <div className="leading-badge rotated">LEADING ▲</div>
                )}
            </div>

            {/* ── Middle UI ── */}
            <div className="middle-ui">

                {gameState === 'IDLE' && (
                    <div className="overlay-content">
                        <div className="idle-icon">👆</div>
                        <h1>FASTEST FINGER</h1>
                        <p>1v1 · Tap as fast as you can · 10 seconds</p>
                        <button className="start-btn" onClick={startGame}>START BATTLE</button>
                    </div>
                )}

                {gameState === 'COUNTDOWN' && (
                    <div className="countdown-wrapper">
                        <div className="countdown-number" key={countdown}>{countdown}</div>
                        <div className="countdown-label">GET READY</div>
                    </div>
                )}

                {gameState === 'GO' && (
                    <div className="go-flash">GO!</div>
                )}

                {isPlaying && (
                    <div className="game-timer">
                        <div
                            className="timer-bar"
                            style={{
                                width: `${timerPercent}%`,
                                background: timerPercent < 30
                                    ? 'linear-gradient(90deg, #ff3c3c, #ff9900)'
                                    : 'linear-gradient(90deg, #ff0090, #00f5ff)',
                            }}
                        />
                        <div className="timer-bar-glow" style={{ width: `${timerPercent}%` }} />
                        <span className="timer-text">{timerSeconds}s</span>
                    </div>
                )}

                {gameState === 'RESULT' && (() => {
                    const { text, player } = getWinner();
                    return (
                        <div className={`result-overlay result-${player ?? 'draw'}`}>
                            <div className="trophy-icon">{player === null ? '🤝' : '🏆'}</div>
                            <h2 className="winner-text">{text}</h2>
                            <div className="final-scores">
                                <div className={`score-item rotated ${player === 'top' ? 'score-winner' : ''}`}>
                                    <span>TOP</span>
                                    <strong style={{ color: '#ff0090' }}>{scores.top}</strong>
                                </div>
                                <div className="score-divider">VS</div>
                                <div className={`score-item ${player === 'bottom' ? 'score-winner' : ''}`}>
                                    <span>BOTTOM</span>
                                    <strong style={{ color: '#00f5ff' }}>{scores.bottom}</strong>
                                </div>
                            </div>
                            <button className="reset-btn" onClick={startGame}>↺ REMATCH</button>
                        </div>
                    );
                })()}
            </div>

            {/* ── Bottom Player ── */}
            <div
                className={`player-section bottom-player ${isPlaying ? 'active' : ''} ${leading === 'bottom' && isPlaying ? 'leading' : ''}`}
                onPointerDown={isPlaying ? (e) => handleTap('bottom', e.clientX, e.clientY) : undefined}
                style={{ touchAction: 'none' }}
            >
                <div className="player-bg-glow bottom-glow" />
                <div className={`score-display ${lastScored === 'bottom' ? 'score-pop' : ''}`}>
                    {scores.bottom}
                </div>
                {isPlaying && <div className="tap-hint">TAP TAP TAP!</div>}
                {isPlaying && leading === 'bottom' && (
                    <div className="leading-badge">LEADING ▲</div>
                )}
            </div>

            {/* ── Tap effects ── */}
            {tapEffects.map(effect => (
                <div
                    key={effect.id}
                    className={`tap-effect tap-${effect.player}`}
                    style={{ left: effect.x - 50, top: effect.y - 50 }}
                />
            ))}

            <div className="scanlines" />
        </div>
    );
};
