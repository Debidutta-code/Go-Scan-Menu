import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import './FastestFingerGame.css';
const GAME_DURATION_MS = 10000;
const TICK_MS = 50;
export const FastestFingerGame = () => {
    const [gameState, setGameState] = useState('IDLE');
    const [countdown, setCountdown] = useState(3);
    const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
    const [scores, setScores] = useState({ top: 0, bottom: 0 });
    const [tapEffects, setTapEffects] = useState([]);
    const [lastScored, setLastScored] = useState(null);
    const intervalRef = useRef(null);
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
        if (gameState !== 'COUNTDOWN')
            return;
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
        if (gameState !== 'GO')
            return;
        const t = setTimeout(() => {
            setGameState('PLAYING');
            setTimeLeftMs(GAME_DURATION_MS);
        }, 700);
        return () => clearTimeout(t);
    }, [gameState]);
    /* ── Game timer ── */
    useEffect(() => {
        if (gameState !== 'PLAYING')
            return;
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
    const handleTap = useCallback((player, x, y) => {
        if (gameState !== 'PLAYING')
            return;
        const effect = { id: Date.now() + Math.random(), x, y, player };
        setTapEffects(prev => [...prev, effect]);
        setTimeout(() => setTapEffects(prev => prev.filter(e => e.id !== effect.id)), 500);
        setScores(prev => ({ ...prev, [player]: prev[player] + 1 }));
        setLastScored(player);
    }, [gameState]);
    /* ── Winner logic ── */
    const getWinner = () => {
        if (scores.top > scores.bottom)
            return { text: 'TOP WINS!', player: 'top' };
        if (scores.bottom > scores.top)
            return { text: 'BOTTOM WINS!', player: 'bottom' };
        return { text: "IT'S A DRAW!", player: null };
    };
    const timerPercent = (timeLeftMs / GAME_DURATION_MS) * 100;
    const timerSeconds = (timeLeftMs / 1000).toFixed(1);
    const isPlaying = gameState === 'PLAYING';
    /* ── Who's leading ── */
    const leading = scores.top > scores.bottom ? 'top'
        : scores.bottom > scores.top ? 'bottom' : null;
    return (_jsxs("div", { className: "fastest-finger-container", children: [_jsxs("div", { className: `player-section top-player ${isPlaying ? 'active' : ''} ${leading === 'top' && isPlaying ? 'leading' : ''}`, onPointerDown: isPlaying ? (e) => handleTap('top', e.clientX, e.clientY) : undefined, style: { touchAction: 'none' }, children: [_jsx("div", { className: "player-bg-glow top-glow" }), _jsx("div", { className: `score-display rotated ${lastScored === 'top' ? 'score-pop' : ''}`, children: scores.top }), isPlaying && _jsx("div", { className: "tap-hint rotated", children: "TAP TAP TAP!" }), isPlaying && leading === 'top' && (_jsx("div", { className: "leading-badge rotated", children: "LEADING \u25B2" }))] }), _jsxs("div", { className: "middle-ui", children: [gameState === 'IDLE' && (_jsxs("div", { className: "overlay-content", children: [_jsx("div", { className: "idle-icon", children: "\uD83D\uDC46" }), _jsx("h1", { children: "FASTEST FINGER" }), _jsx("p", { children: "1v1 \u00B7 Tap as fast as you can \u00B7 10 seconds" }), _jsx("button", { className: "start-btn", onClick: startGame, children: "START BATTLE" })] })), gameState === 'COUNTDOWN' && (_jsxs("div", { className: "countdown-wrapper", children: [_jsx("div", { className: "countdown-number", children: countdown }, countdown), _jsx("div", { className: "countdown-label", children: "GET READY" })] })), gameState === 'GO' && (_jsx("div", { className: "go-flash", children: "GO!" })), isPlaying && (_jsxs("div", { className: "game-timer", children: [_jsx("div", { className: "timer-bar", style: {
                                    width: `${timerPercent}%`,
                                    background: timerPercent < 30
                                        ? 'linear-gradient(90deg, #ff3c3c, #ff9900)'
                                        : 'linear-gradient(90deg, #ff0090, #00f5ff)',
                                } }), _jsx("div", { className: "timer-bar-glow", style: { width: `${timerPercent}%` } }), _jsxs("span", { className: "timer-text", children: [timerSeconds, "s"] })] })), gameState === 'RESULT' && (() => {
                        const { text, player } = getWinner();
                        return (_jsxs("div", { className: `result-overlay result-${player ?? 'draw'}`, children: [_jsx("div", { className: "trophy-icon", children: player === null ? '🤝' : '🏆' }), _jsx("h2", { className: "winner-text", children: text }), _jsxs("div", { className: "final-scores", children: [_jsxs("div", { className: `score-item rotated ${player === 'top' ? 'score-winner' : ''}`, children: [_jsx("span", { children: "TOP" }), _jsx("strong", { style: { color: '#ff0090' }, children: scores.top })] }), _jsx("div", { className: "score-divider", children: "VS" }), _jsxs("div", { className: `score-item ${player === 'bottom' ? 'score-winner' : ''}`, children: [_jsx("span", { children: "BOTTOM" }), _jsx("strong", { style: { color: '#00f5ff' }, children: scores.bottom })] })] }), _jsx("button", { className: "reset-btn", onClick: startGame, children: "\u21BA REMATCH" })] }));
                    })()] }), _jsxs("div", { className: `player-section bottom-player ${isPlaying ? 'active' : ''} ${leading === 'bottom' && isPlaying ? 'leading' : ''}`, onPointerDown: isPlaying ? (e) => handleTap('bottom', e.clientX, e.clientY) : undefined, style: { touchAction: 'none' }, children: [_jsx("div", { className: "player-bg-glow bottom-glow" }), _jsx("div", { className: `score-display ${lastScored === 'bottom' ? 'score-pop' : ''}`, children: scores.bottom }), isPlaying && _jsx("div", { className: "tap-hint", children: "TAP TAP TAP!" }), isPlaying && leading === 'bottom' && (_jsx("div", { className: "leading-badge", children: "LEADING \u25B2" }))] }), tapEffects.map(effect => (_jsx("div", { className: `tap-effect tap-${effect.player}`, style: { left: effect.x - 50, top: effect.y - 50 } }, effect.id))), _jsx("div", { className: "scanlines" })] }));
};
