import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import './ChidiyaUddGame.css';
const ITEMS = [
    // Flying ✈️
    { emoji: '🐦', name: 'Chidiya', flies: true },
    { emoji: '🦅', name: 'Eagle', flies: true },
    { emoji: '🦋', name: 'Butterfly', flies: true },
    { emoji: '🐝', name: 'Bee', flies: true },
    { emoji: '🦜', name: 'Parrot', flies: true },
    { emoji: '✈️', name: 'Airplane', flies: true },
    { emoji: '🚁', name: 'Helicopter', flies: true },
    { emoji: '🎈', name: 'Balloon', flies: true },
    { emoji: '🪁', name: 'Kite', flies: true },
    { emoji: '🦆', name: 'Duck', flies: true },
    { emoji: '🦉', name: 'Owl', flies: true },
    { emoji: '🚀', name: 'Rocket', flies: true },
    { emoji: '🦟', name: 'Mosquito', flies: true },
    { emoji: '🪰', name: 'Fly', flies: true },
    // Non-flying 🐘
    { emoji: '🐘', name: 'Elephant', flies: false },
    { emoji: '🦁', name: 'Lion', flies: false },
    { emoji: '🐄', name: 'Cow', flies: false },
    { emoji: '🐢', name: 'Turtle', flies: false },
    { emoji: '🐊', name: 'Crocodile', flies: false },
    { emoji: '🐍', name: 'Snake', flies: false },
    { emoji: '🏠', name: 'House', flies: false },
    { emoji: '🚂', name: 'Train', flies: false },
    { emoji: '🪨', name: 'Rock', flies: false },
    { emoji: '🐟', name: 'Fish', flies: false },
    { emoji: '🦛', name: 'Hippo', flies: false },
    { emoji: '🐻', name: 'Bear', flies: false },
    { emoji: '🌊', name: 'Wave', flies: false },
    { emoji: '🦞', name: 'Lobster', flies: false },
];
const TOTAL_ROUNDS = 7;
const REACT_TIME_MS = 2000;
const TICK_MS = 50;
const RING_C = 2 * Math.PI * 44;
export const ChidiyaUddGame = () => {
    const [phase, setPhase] = useState('IDLE');
    const [topDown, setTopDown] = useState(false);
    const [bottomDown, setBottomDown] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [timeLeftMs, setTimeLeftMs] = useState(REACT_TIME_MS);
    const [topLifted, setTopLifted] = useState(false);
    const [bottomLifted, setBottomLifted] = useState(false);
    const [scores, setScores] = useState({ top: 0, bottom: 0 });
    const [round, setRound] = useState(0);
    const [roundResult, setRoundResult] = useState(null);
    const [revealDelay, setRevealDelay] = useState(false);
    const timerRef = useRef(null);
    const phaseRef = useRef('IDLE');
    const topLiftedRef = useRef(false);
    const bottomLiftedRef = useRef(false);
    const topDownRef = useRef(false);
    const bottomDownRef = useRef(false);
    const currentItemRef = useRef(null);
    phaseRef.current = phase;
    topDownRef.current = topDown;
    bottomDownRef.current = bottomDown;
    currentItemRef.current = currentItem;
    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    const pickItem = () => ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const judgeRound = useCallback((item, tLifted, bLifted) => {
        clearTimer();
        const topCorrect = item.flies ? tLifted : !tLifted;
        const bottomCorrect = item.flies ? bLifted : !bLifted;
        let message = '';
        if (topCorrect && bottomCorrect)
            message = '✅ Both correct! +1 each!';
        else if (!topCorrect && !bottomCorrect)
            message = '💀 Both wrong! No points!';
        else if (topCorrect && !bottomCorrect)
            message = '🏆 TOP player wins this round!';
        else
            message = '🏆 BOTTOM player wins this round!';
        setScores(prev => ({
            top: prev.top + (topCorrect ? 1 : 0),
            bottom: prev.bottom + (bottomCorrect ? 1 : 0),
        }));
        setRoundResult({ topCorrect, bottomCorrect, message });
        setPhase('RESULT');
    }, []);
    // WAITING → SHOWING: when both hold, wait briefly then show item
    useEffect(() => {
        if (phase !== 'WAITING')
            return;
        if (topDown && bottomDown) {
            setRevealDelay(true);
            const t = setTimeout(() => {
                const item = pickItem();
                setCurrentItem(item);
                topLiftedRef.current = false;
                bottomLiftedRef.current = false;
                setTopLifted(false);
                setBottomLifted(false);
                setTimeLeftMs(REACT_TIME_MS);
                setRevealDelay(false);
                setPhase('SHOWING');
            }, 900);
            return () => { clearTimeout(t); setRevealDelay(false); };
        }
    }, [phase, topDown, bottomDown]);
    // SHOWING timer
    useEffect(() => {
        if (phase !== 'SHOWING' || !currentItem)
            return;
        clearTimer();
        timerRef.current = setInterval(() => {
            setTimeLeftMs(prev => {
                const next = prev - TICK_MS;
                if (next <= 0) {
                    judgeRound(currentItemRef.current, topLiftedRef.current, bottomLiftedRef.current);
                    return 0;
                }
                return next;
            });
        }, TICK_MS);
        return clearTimer;
    }, [phase, currentItem, judgeRound]);
    const handleLift = useCallback((player) => {
        if (phaseRef.current !== 'SHOWING')
            return;
        if (player === 'top' && !topLiftedRef.current) {
            topLiftedRef.current = true;
            setTopLifted(true);
        }
        if (player === 'bottom' && !bottomLiftedRef.current) {
            bottomLiftedRef.current = true;
            setBottomLifted(true);
        }
        // Judge immediately if both lifted
        if (topLiftedRef.current && bottomLiftedRef.current) {
            judgeRound(currentItemRef.current, true, true);
        }
    }, [judgeRound]);
    const goNextRound = () => {
        const nextRound = round + 1;
        setRoundResult(null);
        setTopDown(false);
        setBottomDown(false);
        topDownRef.current = false;
        bottomDownRef.current = false;
        if (nextRound >= TOTAL_ROUNDS) {
            setRound(nextRound);
            setPhase('GAME_OVER');
        }
        else {
            setRound(nextRound);
            setPhase('WAITING');
        }
    };
    const startGame = () => {
        clearTimer();
        setScores({ top: 0, bottom: 0 });
        setRound(0);
        setRoundResult(null);
        setTopDown(false);
        setBottomDown(false);
        setCurrentItem(null);
        setRevealDelay(false);
        topDownRef.current = false;
        bottomDownRef.current = false;
        setPhase('WAITING');
    };
    const timerPercent = (timeLeftMs / REACT_TIME_MS) * 100;
    const ringOffset = RING_C * (1 - timerPercent / 100);
    const isWaiting = phase === 'WAITING';
    const isShowing = phase === 'SHOWING';
    const isResult = phase === 'RESULT';
    /* ── Zone event helpers ── */
    const onZoneDown = (player) => {
        if (phase === 'GAME_OVER' || phase === 'IDLE')
            return;
        if (player === 'top') {
            setTopDown(true);
            topDownRef.current = true;
        }
        else {
            setBottomDown(true);
            bottomDownRef.current = true;
        }
    };
    const onZoneUp = (player) => {
        if (isShowing)
            handleLift(player);
        if (player === 'top') {
            setTopDown(false);
            topDownRef.current = false;
        }
        else {
            setBottomDown(false);
            bottomDownRef.current = false;
        }
    };
    const onZoneLeave = (player) => {
        const wasDown = player === 'top' ? topDownRef.current : bottomDownRef.current;
        if (isShowing && wasDown)
            handleLift(player);
        if (player === 'top') {
            setTopDown(false);
            topDownRef.current = false;
        }
        else {
            setBottomDown(false);
            bottomDownRef.current = false;
        }
    };
    return (_jsxs("div", { className: "cu-container", children: [_jsx("div", { className: `cu-zone cu-zone--top ${topDown ? 'cu-zone--held' : ''} ${isResult && roundResult?.topCorrect ? 'cu-zone--correct' : ''} ${isResult && roundResult && !roundResult.topCorrect ? 'cu-zone--wrong' : ''}`, onPointerDown: () => onZoneDown('top'), onPointerUp: () => onZoneUp('top'), onPointerLeave: () => onZoneLeave('top'), style: { touchAction: 'none' }, children: _jsxs("div", { className: "cu-zone-inner rotated", children: [_jsx("div", { className: "cu-score-num", children: scores.top }), _jsx("div", { className: `cu-finger-blob ${topDown ? 'held' : ''} ${isShowing && topLifted ? 'lifted' : ''}`, children: _jsx("span", { children: topDown && !topLifted ? '☝️' : topLifted ? '🙌' : '👇' }) }), _jsx("div", { className: "cu-zone-label", children: (isWaiting || isShowing) && !topDown ? 'HOLD FINGER' :
                                topDown && revealDelay ? 'READY...' :
                                    topDown && isShowing ? (topLifted ? 'LIFTED!' : 'HOLDING') :
                                        isResult ? (roundResult?.topCorrect ? '✓ CORRECT' : '✗ WRONG') :
                                            'HOLD FINGER' })] }) }), _jsxs("div", { className: "cu-middle", children: [phase === 'IDLE' && (_jsxs("div", { className: "cu-card cu-idle-card", children: [_jsx("div", { className: "cu-hero-bird", children: "\uD83D\uDC26" }), _jsx("h1", { className: "cu-title", children: "CHIDIYA UDD" }), _jsx("p", { className: "cu-subtitle", children: "2 Player \u00B7 React in 2 seconds!" }), _jsxs("div", { className: "cu-rules", children: [_jsx("div", { className: "cu-rule cu-rule--fly", children: "\uD83D\uDC26 Flying \u2192 LIFT your finger" }), _jsx("div", { className: "cu-rule cu-rule--stay", children: "\uD83D\uDC18 Not flying \u2192 KEEP holding" }), _jsx("div", { className: "cu-rule cu-rule--time", children: "\u26A1 Wrong move = point lost!" })] }), _jsx("button", { className: "cu-btn", onClick: startGame, children: "START GAME" })] })), isWaiting && (_jsxs("div", { className: "cu-waiting-ui", children: [_jsxs("div", { className: "cu-round-pill", children: ["Round ", round + 1, " / ", TOTAL_ROUNDS] }), _jsx("div", { className: "cu-waiting-label", children: !topDown && !bottomDown ? 'Both hold your zone!' :
                                    !topDown ? 'TOP — hold your zone!' :
                                        !bottomDown ? 'BOTTOM — hold your zone!' :
                                            revealDelay ? '🎯 Get Ready...' : '...' }), _jsxs("div", { className: "cu-hold-dots", children: [_jsx("div", { className: `cu-hold-dot ${topDown ? 'cu-hold-dot--on' : ''}`, children: "\u25B2 TOP" }), _jsx("div", { className: `cu-hold-dot ${bottomDown ? 'cu-hold-dot--on' : ''}`, children: "\u25BC BOT" })] })] })), isShowing && currentItem && (_jsxs("div", { className: "cu-showing-ui", children: [_jsxs("div", { className: "cu-item-card", children: [_jsx("div", { className: `cu-item-emoji ${currentItem.flies ? 'cu-item-emoji--fly' : ''}`, children: currentItem.emoji }), _jsxs("div", { className: "cu-item-call", children: [_jsx("span", { className: "cu-item-name", children: currentItem.name }), _jsx("span", { className: "cu-item-udd", children: " \u0909\u0921\u094D\u0921!" })] })] }), _jsxs("div", { className: "cu-timer-ring-wrap", children: [_jsxs("svg", { className: "cu-timer-svg", viewBox: "0 0 100 100", children: [_jsx("circle", { cx: "50", cy: "50", r: "44", className: "cu-ring-bg" }), _jsx("circle", { cx: "50", cy: "50", r: "44", className: "cu-ring-fill", strokeDasharray: `${RING_C}`, strokeDashoffset: `${ringOffset}`, style: { stroke: timerPercent < 40 ? '#ff4444' : '#39ff14' } })] }), _jsx("div", { className: "cu-timer-num", children: (timeLeftMs / 1000).toFixed(1) })] }), _jsxs("div", { className: "cu-lift-status", children: [_jsxs("div", { className: `cu-ls-dot ${topLifted ? 'cu-ls-dot--lifted' : ''}`, children: ["\u25B2 TOP ", topLifted ? 'LIFTED' : '...'] }), _jsxs("div", { className: `cu-ls-dot ${bottomLifted ? 'cu-ls-dot--lifted' : ''}`, children: ["\u25BC BOT ", bottomLifted ? 'LIFTED' : '...'] })] })] })), isResult && roundResult && currentItem && (_jsxs("div", { className: "cu-result-ui", children: [_jsxs("div", { className: "cu-result-item-row", children: [_jsx("span", { className: "cu-result-emoji", children: currentItem.emoji }), _jsx("span", { className: "cu-result-verdict", children: currentItem.flies ? '🐦 Should LIFT!' : '🐘 Should STAY!' })] }), _jsx("div", { className: "cu-result-msg", children: roundResult.message }), _jsxs("div", { className: "cu-scoreboard", children: [_jsxs("div", { className: `cu-sb-col rotated ${roundResult.topCorrect ? 'cu-sb-col--win' : 'cu-sb-col--lose'}`, children: [_jsx("span", { children: "TOP" }), _jsx("strong", { children: scores.top }), _jsx("div", { className: "cu-sb-icon", children: roundResult.topCorrect ? '✓' : '✗' })] }), _jsx("div", { className: "cu-sb-vs", children: "VS" }), _jsxs("div", { className: `cu-sb-col ${roundResult.bottomCorrect ? 'cu-sb-col--win' : 'cu-sb-col--lose'}`, children: [_jsx("span", { children: "BOTTOM" }), _jsx("strong", { children: scores.bottom }), _jsx("div", { className: "cu-sb-icon", children: roundResult.bottomCorrect ? '✓' : '✗' })] })] }), _jsx("button", { className: "cu-btn cu-btn--next", onClick: goNextRound, children: round + 1 >= TOTAL_ROUNDS ? 'FINAL RESULTS →' : 'NEXT ROUND →' })] })), phase === 'GAME_OVER' && (_jsxs("div", { className: "cu-gameover-ui", children: [_jsx("div", { className: "cu-go-trophy", children: scores.top > scores.bottom ? '🏆' : scores.bottom > scores.top ? '🏆' : '🤝' }), _jsx("h2", { className: "cu-go-title", children: scores.top > scores.bottom ? 'TOP WINS!' :
                                    scores.bottom > scores.top ? 'BOTTOM WINS!' : "DRAW!" }), _jsxs("div", { className: "cu-final-scores", children: [_jsxs("div", { className: `cu-fs-col rotated ${scores.top >= scores.bottom ? 'cu-fs-col--champ' : ''}`, children: [_jsx("span", { children: "TOP" }), _jsx("strong", { children: scores.top })] }), _jsx("div", { className: "cu-fs-vs", children: "VS" }), _jsxs("div", { className: `cu-fs-col ${scores.bottom >= scores.top ? 'cu-fs-col--champ' : ''}`, children: [_jsx("span", { children: "BOTTOM" }), _jsx("strong", { children: scores.bottom })] })] }), _jsx("button", { className: "cu-btn", onClick: startGame, children: "\u21BA PLAY AGAIN" })] }))] }), _jsx("div", { className: `cu-zone cu-zone--bottom ${bottomDown ? 'cu-zone--held' : ''} ${isResult && roundResult?.bottomCorrect ? 'cu-zone--correct' : ''} ${isResult && roundResult && !roundResult.bottomCorrect ? 'cu-zone--wrong' : ''}`, onPointerDown: () => onZoneDown('bottom'), onPointerUp: () => onZoneUp('bottom'), onPointerLeave: () => onZoneLeave('bottom'), style: { touchAction: 'none' }, children: _jsxs("div", { className: "cu-zone-inner", children: [_jsx("div", { className: "cu-score-num", children: scores.bottom }), _jsx("div", { className: `cu-finger-blob ${bottomDown ? 'held' : ''} ${isShowing && bottomLifted ? 'lifted' : ''}`, children: _jsx("span", { children: bottomDown && !bottomLifted ? '☝️' : bottomLifted ? '🙌' : '👇' }) }), _jsx("div", { className: "cu-zone-label", children: (isWaiting || isShowing) && !bottomDown ? 'HOLD FINGER' :
                                bottomDown && revealDelay ? 'READY...' :
                                    bottomDown && isShowing ? (bottomLifted ? 'LIFTED!' : 'HOLDING') :
                                        isResult ? (roundResult?.bottomCorrect ? '✓ CORRECT' : '✗ WRONG') :
                                            'HOLD FINGER' })] }) }), _jsx("div", { className: "cu-scanlines" })] }));
};
