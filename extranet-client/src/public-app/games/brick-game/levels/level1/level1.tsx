import React, { useEffect, useRef, useState, useCallback } from 'react';
import './level1.css';

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const PADDLE_HEIGHT = 12;
const PADDLE_WIDTH = 100;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 4;
const MAX_DX = 8;

interface Brick {
    x: number;
    y: number;
    status: number;
    color: string;
}

interface LevelProps {
    levelNumber: number;
    onLevelComplete: (score: number) => void;
    onGameOver: () => void;
}

export const Level1: React.FC<LevelProps> = ({ levelNumber, onLevelComplete, onGameOver }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'WON'>('START');

    const gameStateRef = useRef<'START' | 'PLAYING' | 'GAMEOVER' | 'WON'>('START');
    const livesRef = useRef(3);
    const scoreRef = useRef(0);

    const paddleX = useRef(0);
    const ballPos = useRef({ x: 0, y: 0 });
    const ballDX = useRef(INITIAL_BALL_SPEED);
    const ballDY = useRef(-INITIAL_BALL_SPEED);
    const bricks = useRef<Brick[]>([]);
    const animationFrameId = useRef<number>(0);

    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { livesRef.current = lives; }, [lives]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    const getBrickDimensions = useCallback((canvasWidth: number) => {
        const brickPadding = 10;
        const brickOffsetLeft = 20;
        const totalPaddingSpace = brickPadding * (BRICK_COLS - 1);
        const availableWidth = canvasWidth - brickOffsetLeft * 2 - totalPaddingSpace;
        const brickWidth = availableWidth / BRICK_COLS;
        const brickHeight = 25;
        return { brickWidth, brickHeight, brickPadding, brickOffsetLeft };
    }, []);

    const initBricks = useCallback((canvasWidth: number) => {
        const colors = ['#FF4D4D', '#FFB347', '#D1FF47', '#47FFB3', '#47D1FF'];
        const { brickWidth, brickHeight, brickPadding, brickOffsetLeft } = getBrickDimensions(canvasWidth);
        const brickOffsetTop = 80;
        const newBricks: Brick[] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                newBricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + brickOffsetTop,
                    status: 1,
                    color: colors[r % colors.length],
                });
            }
        }
        bricks.current = newBricks;
    }, [getBrickDimensions]);

    const resetBall = useCallback((canvasWidth: number, canvasHeight: number) => {
        ballPos.current = { x: canvasWidth / 2, y: canvasHeight - 120 };
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
        if (bricks.current.length > 0) {
            const { brickWidth, brickHeight, brickPadding, brickOffsetLeft } = getBrickDimensions(width);
            bricks.current.forEach((brick, i) => {
                const r = Math.floor(i / BRICK_COLS);
                const c = i % BRICK_COLS;
                brick.x = c * (brickWidth + brickPadding) + brickOffsetLeft;
                brick.y = r * (brickHeight + brickPadding) + 80;
            });
        }
        resetBall(width, height);
    }, [getBrickDimensions, resetBall]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        initBricks(width);
        resetBall(width, height);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initBricks, handleResize, resetBall]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const currentState = gameStateRef.current;
        const { brickWidth, brickHeight } = getBrickDimensions(canvas.width);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Bricks
        bricks.current.forEach(brick => {
            if (brick.status === 1) {
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brickWidth, brickHeight, 4);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(brick.x, brick.y, brickWidth, 10);
                ctx.closePath();
            }
        });

        // Level label
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${levelNumber}`, canvas.width / 2, 28);
        ctx.textAlign = 'left';

        // Paddle
        const paddleY = canvas.height - 80;
        const grad = ctx.createLinearGradient(paddleX.current, 0, paddleX.current + PADDLE_WIDTH, 0);
        grad.addColorStop(0, '#47D1FF');
        grad.addColorStop(1, '#A088FF');
        ctx.beginPath();
        ctx.roundRect(paddleX.current, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Ball
        ctx.beginPath();
        ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#FFFFFF';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();

        if (currentState === 'PLAYING') {
            let nextX = ballPos.current.x + ballDX.current;
            let nextY = ballPos.current.y + ballDY.current;

            if (nextX + BALL_RADIUS > canvas.width) { ballDX.current = -Math.abs(ballDX.current); nextX = canvas.width - BALL_RADIUS; }
            else if (nextX - BALL_RADIUS < 0) { ballDX.current = Math.abs(ballDX.current); nextX = BALL_RADIUS; }

            if (nextY - BALL_RADIUS < 0) { ballDY.current = Math.abs(ballDY.current); nextY = BALL_RADIUS; }

            // Paddle collision
            if (
                nextY + BALL_RADIUS >= paddleY &&
                nextY - BALL_RADIUS <= paddleY + PADDLE_HEIGHT &&
                nextX >= paddleX.current &&
                nextX <= paddleX.current + PADDLE_WIDTH &&
                ballDY.current > 0
            ) {
                ballDY.current = -Math.abs(ballDY.current);
                const hitPos = (nextX - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
                ballDX.current = Math.max(-MAX_DX, Math.min(MAX_DX, ballDX.current + hitPos * 1.5));
                nextY = paddleY - BALL_RADIUS;
            }

            // Missed
            if (nextY - BALL_RADIUS > canvas.height) {
                const newLives = livesRef.current - 1;
                livesRef.current = newLives;
                if (newLives <= 0) {
                    setLives(0);
                    setGameState('GAMEOVER');
                    gameStateRef.current = 'GAMEOVER';
                } else {
                    setLives(newLives);
                    setGameState('START');
                    gameStateRef.current = 'START';
                    resetBall(canvas.width, canvas.height);
                }
                animationFrameId.current = requestAnimationFrame(draw);
                return;
            }

            // Brick collision
            let hitBrick = false;
            bricks.current.forEach(brick => {
                if (brick.status === 1 && !hitBrick) {
                    if (
                        nextX + BALL_RADIUS > brick.x && nextX - BALL_RADIUS < brick.x + brickWidth &&
                        nextY + BALL_RADIUS > brick.y && nextY - BALL_RADIUS < brick.y + brickHeight
                    ) {
                        ballDY.current = -ballDY.current;
                        brick.status = 0;
                        hitBrick = true;
                        scoreRef.current += 10;
                        setScore(scoreRef.current);
                        if (bricks.current.every(b => b.status === 0)) {
                            setGameState('WON');
                            gameStateRef.current = 'WON';
                        }
                    }
                }
            });

            ballPos.current = { x: nextX, y: nextY };
        }

        animationFrameId.current = requestAnimationFrame(draw);
    }, [getBrickDimensions, resetBall, levelNumber]);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [draw]);

    const handlePointerMove = useCallback((clientX: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        paddleX.current = Math.max(0, Math.min(clientX - rect.left - PADDLE_WIDTH / 2, canvas.width - PADDLE_WIDTH));
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX);
    const handleTouchMove = (e: React.TouchEvent) => { e.preventDefault(); handlePointerMove(e.touches[0].clientX); };
    const handleTouchStart = (e: React.TouchEvent) => { e.preventDefault(); handlePointerMove(e.touches[0].clientX); startGame(); };

    const startGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const state = gameStateRef.current;
        if (state === 'START') {
            setGameState('PLAYING'); gameStateRef.current = 'PLAYING';
        } else if (state === 'GAMEOVER') {
            onGameOver();
        }
    };

    return (
        <div className="level1-container" ref={containerRef}>
            <div className="game-stats-overlay">
                <div className="stat-pill">
                    <span className="label">SCORE</span>
                    <span className="value">{score}</span>
                </div>
                <div className="stat-pill">
                    <span className="label">LIVES</span>
                    <span className="value">{'❤️'.repeat(Math.max(0, lives))}</span>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                onClick={startGame}
                style={{ touchAction: 'none' }}
            />

            {gameState === 'START' && (
                <div className="game-overlay-screen" onClick={startGame}>
                    <div className="overlay-content">
                        <div className="level-badge">LEVEL 1</div>
                        <h2>Brick Smasher</h2>
                        <p>Move your paddle to bounce the ball and smash all bricks!</p>
                        <button className="start-btn">TAP TO START</button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="game-overlay-screen">
                    <div className="overlay-content">
                        <div className="level-badge">LEVEL 1</div>
                        <h2 className="lose">Game Over!</h2>
                        <p>Final Score: {score}</p>
                        <button className="start-btn" onClick={onGameOver}>TRY AGAIN</button>
                    </div>
                </div>
            )}

            {gameState === 'WON' && (
                <div className="game-overlay-screen">
                    <div className="overlay-content">
                        <div className="level-badge">LEVEL 1</div>
                        <h2 className="win">Level Complete!</h2>
                        <p>🎉 You smashed all bricks!</p>
                        <p className="score-display">Score: {score}</p>
                        <button className="start-btn next-btn" onClick={() => onLevelComplete(score)}>
                            NEXT LEVEL →
                        </button>
                    </div>
                </div>
            )}

            <div className="game-grid-bg"></div>
        </div>
    );
};