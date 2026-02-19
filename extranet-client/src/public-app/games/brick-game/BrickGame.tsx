import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './BrickGame.css';

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const PADDLE_HEIGHT = 12;
const PADDLE_WIDTH = 80;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 4;

interface Brick {
    x: number;
    y: number;
    status: number;
    color: string;
}

export const BrickGame: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Game state
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'WON'>('START');

    // Refs for mutable game state (to avoid closure issues in loop)
    const paddleX = useRef(0);
    const ballPos = useRef({ x: 0, y: 0 });
    const ballDX = useRef(INITIAL_BALL_SPEED);
    const ballDY = useRef(-INITIAL_BALL_SPEED);
    const bricks = useRef<Brick[]>([]);
    const animationFrameId = useRef<number>(0);

    const initBricks = useCallback(() => {
        const newBricks: Brick[] = [];
        const colors = ['#FF4D4D', '#FFB347', '#D1FF47', '#47FFB3', '#47D1FF'];
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                newBricks.push({
                    x: 0, // Will be set in resize
                    y: 0, // Will be set in resize
                    status: 1,
                    color: colors[r % colors.length]
                });
            }
        }
        bricks.current = newBricks;
    }, []);

    const resetBall = useCallback((canvasWidth: number, canvasHeight: number) => {
        ballPos.current = { x: canvasWidth / 2, y: canvasHeight - 100 };
        ballDX.current = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ballDY.current = -INITIAL_BALL_SPEED;
        paddleX.current = (canvasWidth - PADDLE_WIDTH) / 2;
    }, []);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        // Position bricks
        const brickPadding = 10;
        const brickOffsetTop = 80;
        const brickOffsetLeft = 20;
        const totalPaddingSpace = brickPadding * (BRICK_COLS - 1);
        const availableWidth = width - (brickOffsetLeft * 2) - totalPaddingSpace;
        const brickWidth = availableWidth / BRICK_COLS;
        const brickHeight = 25;

        bricks.current.forEach((brick, i) => {
            const r = Math.floor(i / BRICK_COLS);
            const c = i % BRICK_COLS;
            brick.x = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            brick.y = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        });

        if (gameState === 'START') {
            resetBall(width, height);
        }
    }, [gameState, resetBall]);

    useEffect(() => {
        initBricks();
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initBricks, handleResize]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Bricks
        bricks.current.forEach(brick => {
            if (brick.status === 1) {
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, (canvas.width - 40 - (10 * (BRICK_COLS - 1))) / BRICK_COLS, 25, 4);
                ctx.fillStyle = brick.color;
                ctx.fill();

                // Gloss effect on brick
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(brick.x, brick.y, (canvas.width - 40 - (10 * (BRICK_COLS - 1))) / BRICK_COLS, 10);
                ctx.closePath();
            }
        });

        // Draw Paddle
        ctx.beginPath();
        const grad = ctx.createLinearGradient(paddleX.current, 0, paddleX.current + PADDLE_WIDTH, 0);
        grad.addColorStop(0, '#47D1FF');
        grad.addColorStop(1, '#A088FF');
        ctx.roundRect(paddleX.current, canvas.height - 80, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw Ball
        ctx.beginPath();
        ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFFFFF';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();

        if (gameState === 'PLAYING') {
            // Move ball
            let nextX = ballPos.current.x + ballDX.current;
            let nextY = ballPos.current.y + ballDY.current;

            // Wall collisions
            if (nextX + BALL_RADIUS > canvas.width || nextX - BALL_RADIUS < 0) {
                ballDX.current = -ballDX.current;
                nextX = ballPos.current.x + ballDX.current;
            }
            if (nextY - BALL_RADIUS < 0) {
                ballDY.current = -ballDY.current;
                nextY = ballPos.current.y + ballDY.current;
            } else if (nextY + BALL_RADIUS > canvas.height - 80) {
                // Paddle collision
                if (nextX > paddleX.current && nextX < paddleX.current + PADDLE_WIDTH) {
                    ballDY.current = -ballDY.current;
                    // Add some variance based on where it hit the paddle
                    const hitPos = (nextX - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
                    ballDX.current += hitPos * 2;
                } else if (nextY + BALL_RADIUS > canvas.height) {
                    // Missed
                    setLives(prev => {
                        if (prev <= 1) {
                            setGameState('GAMEOVER');
                            return 0;
                        }
                        return prev - 1;
                    });
                    resetBall(canvas.width, canvas.height);
                    setGameState('START');
                }
            }

            // Brick collision
            const brickWidth = (canvas.width - 40 - (10 * (BRICK_COLS - 1))) / BRICK_COLS;
            const brickHeight = 25;
            bricks.current.forEach(brick => {
                if (brick.status === 1) {
                    if (nextX > brick.x && nextX < brick.x + brickWidth &&
                        nextY > brick.y && nextY < brick.y + brickHeight) {
                        ballDY.current = -ballDY.current;
                        brick.status = 0;
                        setScore(s => s + 10);

                        // Check win
                        if (bricks.current.every(b => b.status === 0)) {
                            setGameState('WON');
                        }
                    }
                }
            });

            ballPos.current = { x: nextX, y: nextY };
        }

        animationFrameId.current = requestAnimationFrame(draw);
    }, [gameState, resetBall]);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [draw]);

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;

        paddleX.current = Math.max(0, Math.min(x - PADDLE_WIDTH / 2, canvas.width - PADDLE_WIDTH));
    };

    const startGame = () => {
        if (gameState === 'START') setGameState('PLAYING');
        if (gameState === 'GAMEOVER' || gameState === 'WON') {
            setScore(0);
            setLives(3);
            initBricks();
            resetBall(canvasRef.current?.width || 0, canvasRef.current?.height || 0);
            setGameState('PLAYING');
        }
    };

    return (
        <div className="brick-game-container" ref={containerRef}>
            <div className="game-stats-overlay">
                <div className="stat-pill">
                    <span className="label">SCORE</span>
                    <span className="value">{score}</span>
                </div>
                <div className="stat-pill">
                    <span className="label">LIVES</span>
                    <span className="value">{'❤️'.repeat(lives)}</span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onClick={startGame}
            />

            {gameState === 'START' && (
                <div className="game-overlay-screen" onClick={startGame}>
                    <div className="overlay-content">
                        <h2>Brick Smasher</h2>
                        <p>Move paddle to bounce ball</p>
                        <button className="start-btn">TAP TO START</button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="game-overlay-screen" onClick={startGame}>
                    <div className="overlay-content">
                        <h2 className="lose">Game Over!</h2>
                        <p>Final Score: {score}</p>
                        <button className="start-btn">TRY AGAIN</button>
                    </div>
                </div>
            )}

            {gameState === 'WON' && (
                <div className="game-overlay-screen" onClick={startGame}>
                    <div className="overlay-content">
                        <h2 className="win">Victory!</h2>
                        <p>You smashed all bricks!</p>
                        <p>Final Score: {score}</p>
                        <button className="start-btn">PLAY AGAIN</button>
                    </div>
                </div>
            )}

            <div className="game-grid-bg"></div>
        </div>
    );
};
