import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import './FingerPickGame.css';
const COLORS = [
    '#FF3CAC', '#00F5FF', '#FFE600', '#39FF14',
    '#FF6B35', '#A855F7', '#00FFB3', '#FF4D4D',
];
const COUNTDOWN_START = 3;
const RING_R = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;
const generateConfetti = () => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    x: Math.random() * 90 + 5,
    dx: (Math.random() - 0.5) * 240,
    delay: Math.random() * 1,
    dur: Math.random() * 1.4 + 1.4,
    size: Math.random() * 6 + 6,
}));
/* ── Particle Canvas Background ── */
const ParticleCanvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        const particles = Array.from({ length: 90 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.5 + 0.4,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            alpha: Math.random() * 0.4 + 0.1,
        }));
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0)
                    p.x = canvas.width;
                if (p.x > canvas.width)
                    p.x = 0;
                if (p.y < 0)
                    p.y = canvas.height;
                if (p.y > canvas.height)
                    p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,245,255,${p.alpha})`;
                ctx.fill();
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);
    return _jsx("canvas", { id: "particle-canvas", ref: canvasRef });
};
/* ── Main Game Component ── */
export const FingerPickGame = () => {
    const [touches, setTouches] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [winner, setWinner] = useState(null);
    const [confetti, setConfetti] = useState([]);
    const [shake, setShake] = useState(false);
    const [ringOffset, setRingOffset] = useState(RING_CIRCUMFERENCE);
    const countdownTimer = useRef(null);
    const containerRef = useRef(null);
    const touchesRef = useRef([]);
    useEffect(() => { touchesRef.current = touches; }, [touches]);
    const updateTouches = useCallback((touchList) => {
        const next = [];
        for (let i = 0; i < touchList.length; i++) {
            const t = touchList[i];
            const existing = touchesRef.current.find(tp => tp.id === t.identifier);
            next.push({
                id: t.identifier,
                x: t.clientX,
                y: t.clientY,
                color: existing?.color ?? COLORS[i % COLORS.length],
            });
        }
        setTouches(next);
    }, []);
    const handleTouchStart = (e) => { if (winner !== null)
        return; e.preventDefault(); updateTouches(e.touches); };
    const handleTouchMove = (e) => { if (winner !== null)
        return; e.preventDefault(); updateTouches(e.touches); };
    const handleTouchEnd = (e) => { if (winner !== null)
        return; e.preventDefault(); updateTouches(e.touches); };
    /* Start / reset countdown when finger count changes */
    useEffect(() => {
        if (winner !== null)
            return;
        if (touches.length >= 2) {
            if (countdown === null) {
                setCountdown(COUNTDOWN_START);
                setRingOffset(RING_CIRCUMFERENCE);
            }
        }
        else {
            setCountdown(null);
            setRingOffset(RING_CIRCUMFERENCE);
            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
                countdownTimer.current = null;
            }
        }
    }, [touches.length, winner]);
    /* Screen shake on each tick */
    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            setShake(true);
            const t = setTimeout(() => setShake(false), 180);
            return () => clearTimeout(t);
        }
    }, [countdown]);
    /* Countdown tick */
    useEffect(() => {
        if (countdown !== null && countdown > 0 && !countdownTimer.current) {
            countdownTimer.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null)
                        return prev;
                    const next = prev - 1;
                    setRingOffset(RING_CIRCUMFERENCE * (next / COUNTDOWN_START));
                    if (next <= 0) {
                        clearInterval(countdownTimer.current);
                        countdownTimer.current = null;
                        pickWinner();
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => { if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
        } };
    }, [countdown]);
    const pickWinner = () => {
        setTouches(current => {
            if (current.length > 0) {
                const idx = Math.floor(Math.random() * current.length);
                setWinner(current[idx].id);
                setConfetti(generateConfetti());
            }
            return current;
        });
        setCountdown(null);
    };
    const resetGame = () => {
        setWinner(null);
        setCountdown(null);
        setTouches([]);
        setConfetti([]);
        setRingOffset(RING_CIRCUMFERENCE);
    };
    /* Prevent scroll/zoom */
    useEffect(() => {
        const el = containerRef.current;
        if (!el)
            return;
        const prevent = (e) => {
            // Allow touches on buttons so they remain interactive
            if (e.target instanceof HTMLElement && e.target.closest('button')) {
                return;
            }
            e.preventDefault();
        };
        el.addEventListener('touchstart', prevent, { passive: false });
        el.addEventListener('touchmove', prevent, { passive: false });
        return () => { el.removeEventListener('touchstart', prevent); el.removeEventListener('touchmove', prevent); };
    }, []);
    const winnerTouch = touches.find(t => t.id === winner);
    return (_jsxs("div", { className: `finger-pick-container${shake ? ' container-shake' : ''}`, ref: containerRef, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, onTouchCancel: handleTouchEnd, children: [_jsx(ParticleCanvas, {}), _jsx("div", { className: "scanlines" }), confetti.map(p => (_jsx("div", { className: "confetti-piece", style: {
                    left: `${p.x}%`, top: 0,
                    width: p.size, height: p.size,
                    backgroundColor: p.color,
                    '--dx': `${p.dx}px`,
                    '--delay': `${p.delay}s`,
                    '--dur': `${p.dur}s`,
                } }, p.id))), winner === null && (_jsxs("div", { className: "game-info-overlay", children: [_jsx("h2", { className: "game-title", children: "FINGER PICK" }), _jsx("p", { className: "game-subtitle", children: touches.length === 0
                            ? 'Place 2 or more fingers to begin'
                            : touches.length === 1
                                ? 'Need one more finger...'
                                : `${touches.length} players locked in!` }), touches.length >= 2 && (_jsxs("span", { className: "finger-count", children: [touches.length, " FINGERS DETECTED"] }))] })), countdown !== null && countdown > 0 && winner === null && (_jsxs("div", { className: "countdown-wrapper", children: [_jsxs("div", { className: "countdown-ring", children: [_jsxs("svg", { viewBox: "0 0 120 120", children: [_jsx("circle", { className: "ring-bg", cx: "60", cy: "60", r: RING_R }), _jsx("circle", { className: "ring-fill", cx: "60", cy: "60", r: RING_R, strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: ringOffset })] }), _jsx("div", { className: "countdown-number", children: countdown }, countdown)] }), _jsx("p", { className: "countdown-label", children: "SELECTING WINNER" })] })), winner !== null && (_jsxs("div", { className: "winner-announcement", children: [_jsx("p", { className: "win-badge", children: "\u2014 CHOSEN ONE \u2014" }), _jsx("h2", { className: "win-text", children: "WINNER!" }), winnerTouch && (_jsx("div", { className: "winner-color-dot", style: { backgroundColor: winnerTouch.color, boxShadow: `0 0 30px ${winnerTouch.color}` } })), _jsx("div", { className: "win-divider" }), _jsx("button", { className: "reset-btn", onClick: resetGame, children: "\u21BA PLAY AGAIN" })] })), touches.map((touch, i) => (_jsxs("div", { className: `touch-indicator ${winner === touch.id ? 'winner' : ''} ${winner !== null && winner !== touch.id ? 'loser' : ''}`, style: { left: touch.x, top: touch.y, '--touch-color': touch.color }, children: [_jsx("div", { className: "plasma-ring-2" }), _jsx("div", { className: "plasma-ring" }), _jsx("div", { className: "inner-circle", children: _jsx("span", { className: "finger-icon", children: "\u261D" }) }), _jsx("div", { className: "ripple" }), _jsx("div", { className: "ripple" }), _jsx("div", { className: "ripple" }), _jsxs("div", { className: "player-num", children: ["P", i + 1] })] }, touch.id)))] }));
};
