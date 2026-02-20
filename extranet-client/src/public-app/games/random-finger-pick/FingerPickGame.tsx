import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './FingerPickGame.css';

interface TouchPoint {
    id: number;
    x: number;
    y: number;
    color: string;
}

const COLORS = [
    '#FF4D4D', '#4D79FF', '#4DFF79', '#FFD44D',
    '#FF4DFF', '#4DFFFF', '#FF9F4D', '#9F4DFF'
];

export const FingerPickGame: React.FC = () => {
    const [touches, setTouches] = useState<TouchPoint[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [winner, setWinner] = useState<number | null>(null);
    const countdownTimer = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getRandomColor = (index: number) => COLORS[index % COLORS.length];

    const handleTouchStart = (e: React.TouchEvent) => {
        if (winner !== null) return;
        updateTouches(e.touches);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (winner !== null) return;
        updateTouches(e.touches);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (winner !== null) {
            // If all fingers removed after winner selected, reset after a delay or just allow reset
            if (e.touches.length === 0) {
                // reset logic can go here or via a button
            }
            return;
        }
        updateTouches(e.touches);
    };

    const updateTouches = (touchList: React.TouchList) => {
        const newTouches: TouchPoint[] = [];
        for (let i = 0; i < touchList.length; i++) {
            const touch = touchList[i];
            newTouches.push({
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                color: getRandomColor(i)
            });
        }
        setTouches(newTouches);
    };

    useEffect(() => {
        if (winner !== null) return;

        if (touches.length >= 2) {
            if (countdown === null) {
                setCountdown(3);
            }
        } else {
            setCountdown(null);
            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
                countdownTimer.current = null;
            }
        }
    }, [touches.length, countdown, winner]);

    useEffect(() => {
        if (countdown !== null && countdown > 0 && !countdownTimer.current) {
            countdownTimer.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev !== null && prev > 1) return prev - 1;

                    // Countdown finished!
                    if (countdownTimer.current) {
                        clearInterval(countdownTimer.current);
                        countdownTimer.current = null;
                    }

                    pickWinner();
                    return 0;
                });
            }, 1000);
        }

        return () => {
            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
                countdownTimer.current = null;
            }
        };
    }, [countdown]);

    const pickWinner = () => {
        setTouches(currentTouches => {
            if (currentTouches.length > 0) {
                const randomIndex = Math.floor(Math.random() * currentTouches.length);
                setWinner(currentTouches[randomIndex].id);
            }
            return currentTouches;
        });
        setCountdown(null);
    };

    const resetGame = () => {
        setWinner(null);
        setCountdown(null);
        setTouches([]);
    };

    // Prevent default touch behavior (scrolling, zooming)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const preventDefault = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        container.addEventListener('touchstart', preventDefault, { passive: false });
        container.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            container.removeEventListener('touchstart', preventDefault);
            container.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    return (
        <div
            className="finger-pick-container"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <div className="game-info-overlay">
                {winner === null ? (
                    <>
                        <h2>Random Finger Pick</h2>
                        <p>Tap and hold with 2 or more fingers</p>
                        {countdown !== null && (
                            <div className="countdown-display">{countdown > 0 ? countdown : "!"}</div>
                        )}
                    </>
                ) : (
                    <div className="winner-announcement">
                        <h2 className="win-text">WE HAVE A WINNER!</h2>
                        <button className="reset-btn" onClick={resetGame}>PLAY AGAIN</button>
                    </div>
                )}
            </div>

            {touches.map((touch) => (
                <div
                    key={touch.id}
                    className={`touch-indicator ${winner === touch.id ? 'winner' : ''} ${winner !== null && winner !== touch.id ? 'loser' : ''}`}
                    style={{
                        left: touch.x,
                        top: touch.y,
                        '--touch-color': touch.color
                    } as React.CSSProperties}
                >
                    <div className="ripple"></div>
                    <div className="inner-circle"></div>
                </div>
            ))}
        </div>
    );
};
