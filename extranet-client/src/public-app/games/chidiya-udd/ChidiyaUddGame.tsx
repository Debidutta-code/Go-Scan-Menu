import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChidiyaUddGame.css';

type GamePhase = 'IDLE' | 'WAITING' | 'SHOWING' | 'RESULT' | 'GAME_OVER';

interface Item {
    emoji: string;
    name: string;
    flies: boolean;
}

const ITEMS: Item[] = [
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

export const ChidiyaUddGame: React.FC = () => {
    const [phase, setPhase] = useState<GamePhase>('IDLE');
    const [topDown, setTopDown] = useState(false);
    const [bottomDown, setBottomDown] = useState(false);
    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [timeLeftMs, setTimeLeftMs] = useState(REACT_TIME_MS);
    const [topLifted, setTopLifted] = useState(false);
    const [bottomLifted, setBottomLifted] = useState(false);
    const [scores, setScores] = useState({ top: 0, bottom: 0 });
    const [round, setRound] = useState(0);
    const [roundResult, setRoundResult] = useState<{
        topCorrect: boolean;
        bottomCorrect: boolean;
        message: string;
    } | null>(null);
    const [revealDelay, setRevealDelay] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const phaseRef = useRef<GamePhase>('IDLE');
    const topLiftedRef = useRef(false);
    const bottomLiftedRef = useRef(false);
    const topDownRef = useRef(false);
    const bottomDownRef = useRef(false);
    const currentItemRef = useRef<Item | null>(null);

    phaseRef.current = phase;
    topDownRef.current = topDown;
    bottomDownRef.current = bottomDown;
    currentItemRef.current = currentItem;

    const clearTimer = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    const pickItem = (): Item => ITEMS[Math.floor(Math.random() * ITEMS.length)];

    const judgeRound = useCallback((item: Item, tLifted: boolean, bLifted: boolean) => {
        clearTimer();
        const topCorrect = item.flies ? tLifted : !tLifted;
        const bottomCorrect = item.flies ? bLifted : !bLifted;

        let message = '';
        if (topCorrect && bottomCorrect) message = '✅ Both correct! +1 each!';
        else if (!topCorrect && !bottomCorrect) message = '💀 Both wrong! No points!';
        else if (topCorrect && !bottomCorrect) message = '🏆 TOP player wins this round!';
        else message = '🏆 BOTTOM player wins this round!';

        setScores(prev => ({
            top: prev.top + (topCorrect ? 1 : 0),
            bottom: prev.bottom + (bottomCorrect ? 1 : 0),
        }));
        setRoundResult({ topCorrect, bottomCorrect, message });
        setPhase('RESULT');
    }, []);

    // WAITING → SHOWING: when both hold, wait briefly then show item
    useEffect(() => {
        if (phase !== 'WAITING') return;
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
        if (phase !== 'SHOWING' || !currentItem) return;
        clearTimer();
        timerRef.current = setInterval(() => {
            setTimeLeftMs(prev => {
                const next = prev - TICK_MS;
                if (next <= 0) {
                    judgeRound(currentItemRef.current!, topLiftedRef.current, bottomLiftedRef.current);
                    return 0;
                }
                return next;
            });
        }, TICK_MS);
        return clearTimer;
    }, [phase, currentItem, judgeRound]);

    const handleLift = useCallback((player: 'top' | 'bottom') => {
        if (phaseRef.current !== 'SHOWING') return;
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
            judgeRound(currentItemRef.current!, true, true);
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
        } else {
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
    const onZoneDown = (player: 'top' | 'bottom') => {
        if (phase === 'GAME_OVER' || phase === 'IDLE') return;
        if (player === 'top') { setTopDown(true); topDownRef.current = true; }
        else { setBottomDown(true); bottomDownRef.current = true; }
    };

    const onZoneUp = (player: 'top' | 'bottom') => {
        if (isShowing) handleLift(player);
        if (player === 'top') { setTopDown(false); topDownRef.current = false; }
        else { setBottomDown(false); bottomDownRef.current = false; }
    };

    const onZoneLeave = (player: 'top' | 'bottom') => {
        const wasDown = player === 'top' ? topDownRef.current : bottomDownRef.current;
        if (isShowing && wasDown) handleLift(player);
        if (player === 'top') { setTopDown(false); topDownRef.current = false; }
        else { setBottomDown(false); bottomDownRef.current = false; }
    };

    return (
        <div className="cu-container">

            {/* ── TOP ZONE ── */}
            <div
                className={`cu-zone cu-zone--top ${topDown ? 'cu-zone--held' : ''} ${isResult && roundResult?.topCorrect ? 'cu-zone--correct' : ''} ${isResult && roundResult && !roundResult.topCorrect ? 'cu-zone--wrong' : ''}`}
                onPointerDown={() => onZoneDown('top')}
                onPointerUp={() => onZoneUp('top')}
                onPointerLeave={() => onZoneLeave('top')}
                style={{ touchAction: 'none' }}
            >
                <div className="cu-zone-inner rotated">
                    <div className="cu-score-num">{scores.top}</div>
                    <div className={`cu-finger-blob ${topDown ? 'held' : ''} ${isShowing && topLifted ? 'lifted' : ''}`}>
                        <span>{topDown && !topLifted ? '☝️' : topLifted ? '🙌' : '👇'}</span>
                    </div>
                    <div className="cu-zone-label">
                        {(isWaiting || isShowing) && !topDown ? 'HOLD FINGER' :
                         topDown && revealDelay ? 'READY...' :
                         topDown && isShowing ? (topLifted ? 'LIFTED!' : 'HOLDING') :
                         isResult ? (roundResult?.topCorrect ? '✓ CORRECT' : '✗ WRONG') :
                         'HOLD FINGER'}
                    </div>
                </div>
            </div>

            {/* ── MIDDLE ── */}
            <div className="cu-middle">

                {phase === 'IDLE' && (
                    <div className="cu-card cu-idle-card">
                        <div className="cu-hero-bird">🐦</div>
                        <h1 className="cu-title">CHIDIYA UDD</h1>
                        <p className="cu-subtitle">2 Player · React in 2 seconds!</p>
                        <div className="cu-rules">
                            <div className="cu-rule cu-rule--fly">🐦 Flying → LIFT your finger</div>
                            <div className="cu-rule cu-rule--stay">🐘 Not flying → KEEP holding</div>
                            <div className="cu-rule cu-rule--time">⚡ Wrong move = point lost!</div>
                        </div>
                        <button className="cu-btn" onClick={startGame}>START GAME</button>
                    </div>
                )}

                {isWaiting && (
                    <div className="cu-waiting-ui">
                        <div className="cu-round-pill">Round {round + 1} / {TOTAL_ROUNDS}</div>
                        <div className="cu-waiting-label">
                            {!topDown && !bottomDown ? 'Both hold your zone!' :
                             !topDown ? 'TOP — hold your zone!' :
                             !bottomDown ? 'BOTTOM — hold your zone!' :
                             revealDelay ? '🎯 Get Ready...' : '...'}
                        </div>
                        <div className="cu-hold-dots">
                            <div className={`cu-hold-dot ${topDown ? 'cu-hold-dot--on' : ''}`}>▲ TOP</div>
                            <div className={`cu-hold-dot ${bottomDown ? 'cu-hold-dot--on' : ''}`}>▼ BOT</div>
                        </div>
                    </div>
                )}

                {isShowing && currentItem && (
                    <div className="cu-showing-ui">
                        <div className="cu-item-card">
                            <div className={`cu-item-emoji ${currentItem.flies ? 'cu-item-emoji--fly' : ''}`}>
                                {currentItem.emoji}
                            </div>
                            <div className="cu-item-call">
                                <span className="cu-item-name">{currentItem.name}</span>
                                <span className="cu-item-udd"> उड्ड!</span>
                            </div>
                        </div>
                        <div className="cu-timer-ring-wrap">
                            <svg className="cu-timer-svg" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" className="cu-ring-bg" />
                                <circle
                                    cx="50" cy="50" r="44"
                                    className="cu-ring-fill"
                                    strokeDasharray={`${RING_C}`}
                                    strokeDashoffset={`${ringOffset}`}
                                    style={{ stroke: timerPercent < 40 ? '#ff4444' : '#39ff14' }}
                                />
                            </svg>
                            <div className="cu-timer-num">{(timeLeftMs / 1000).toFixed(1)}</div>
                        </div>
                        <div className="cu-lift-status">
                            <div className={`cu-ls-dot ${topLifted ? 'cu-ls-dot--lifted' : ''}`}>▲ TOP {topLifted ? 'LIFTED' : '...'}</div>
                            <div className={`cu-ls-dot ${bottomLifted ? 'cu-ls-dot--lifted' : ''}`}>▼ BOT {bottomLifted ? 'LIFTED' : '...'}</div>
                        </div>
                    </div>
                )}

                {isResult && roundResult && currentItem && (
                    <div className="cu-result-ui">
                        <div className="cu-result-item-row">
                            <span className="cu-result-emoji">{currentItem.emoji}</span>
                            <span className="cu-result-verdict">
                                {currentItem.flies ? '🐦 Should LIFT!' : '🐘 Should STAY!'}
                            </span>
                        </div>
                        <div className="cu-result-msg">{roundResult.message}</div>
                        <div className="cu-scoreboard">
                            <div className={`cu-sb-col rotated ${roundResult.topCorrect ? 'cu-sb-col--win' : 'cu-sb-col--lose'}`}>
                                <span>TOP</span>
                                <strong>{scores.top}</strong>
                                <div className="cu-sb-icon">{roundResult.topCorrect ? '✓' : '✗'}</div>
                            </div>
                            <div className="cu-sb-vs">VS</div>
                            <div className={`cu-sb-col ${roundResult.bottomCorrect ? 'cu-sb-col--win' : 'cu-sb-col--lose'}`}>
                                <span>BOTTOM</span>
                                <strong>{scores.bottom}</strong>
                                <div className="cu-sb-icon">{roundResult.bottomCorrect ? '✓' : '✗'}</div>
                            </div>
                        </div>
                        <button className="cu-btn cu-btn--next" onClick={goNextRound}>
                            {round + 1 >= TOTAL_ROUNDS ? 'FINAL RESULTS →' : 'NEXT ROUND →'}
                        </button>
                    </div>
                )}

                {phase === 'GAME_OVER' && (
                    <div className="cu-gameover-ui">
                        <div className="cu-go-trophy">
                            {scores.top > scores.bottom ? '🏆' : scores.bottom > scores.top ? '🏆' : '🤝'}
                        </div>
                        <h2 className="cu-go-title">
                            {scores.top > scores.bottom ? 'TOP WINS!' :
                             scores.bottom > scores.top ? 'BOTTOM WINS!' : "DRAW!"}
                        </h2>
                        <div className="cu-final-scores">
                            <div className={`cu-fs-col rotated ${scores.top >= scores.bottom ? 'cu-fs-col--champ' : ''}`}>
                                <span>TOP</span>
                                <strong>{scores.top}</strong>
                            </div>
                            <div className="cu-fs-vs">VS</div>
                            <div className={`cu-fs-col ${scores.bottom >= scores.top ? 'cu-fs-col--champ' : ''}`}>
                                <span>BOTTOM</span>
                                <strong>{scores.bottom}</strong>
                            </div>
                        </div>
                        <button className="cu-btn" onClick={startGame}>↺ PLAY AGAIN</button>
                    </div>
                )}
            </div>

            {/* ── BOTTOM ZONE ── */}
            <div
                className={`cu-zone cu-zone--bottom ${bottomDown ? 'cu-zone--held' : ''} ${isResult && roundResult?.bottomCorrect ? 'cu-zone--correct' : ''} ${isResult && roundResult && !roundResult.bottomCorrect ? 'cu-zone--wrong' : ''}`}
                onPointerDown={() => onZoneDown('bottom')}
                onPointerUp={() => onZoneUp('bottom')}
                onPointerLeave={() => onZoneLeave('bottom')}
                style={{ touchAction: 'none' }}
            >
                <div className="cu-zone-inner">
                    <div className="cu-score-num">{scores.bottom}</div>
                    <div className={`cu-finger-blob ${bottomDown ? 'held' : ''} ${isShowing && bottomLifted ? 'lifted' : ''}`}>
                        <span>{bottomDown && !bottomLifted ? '☝️' : bottomLifted ? '🙌' : '👇'}</span>
                    </div>
                    <div className="cu-zone-label">
                        {(isWaiting || isShowing) && !bottomDown ? 'HOLD FINGER' :
                         bottomDown && revealDelay ? 'READY...' :
                         bottomDown && isShowing ? (bottomLifted ? 'LIFTED!' : 'HOLDING') :
                         isResult ? (roundResult?.bottomCorrect ? '✓ CORRECT' : '✗ WRONG') :
                         'HOLD FINGER'}
                    </div>
                </div>
            </div>

            <div className="cu-scanlines" />
        </div>
    );
};