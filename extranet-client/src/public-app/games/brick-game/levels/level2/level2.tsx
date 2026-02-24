import React, { useEffect, useRef, useState, useCallback } from 'react';
import './level2.css';

const BRICK_ROWS = 7;
const BRICK_COLS = 9;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 80;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 5.5;
const MAX_DX = 10;

interface Brick {
    x: number;
    y: number;
    status: number;
    color: string;
    hitColor: string;
}

interface LevelProps {
    levelNumber: number;
    onLevelComplete: (score: number) => void;
    onGameOver: () => void;
}

export const Level2: React.FC<LevelProps> = ({ levelNumber, onLevelComplete, onGameOver }) => {
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
    const currentPaddleWidth = useRef(PADDLE_WIDTH);

    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { livesRef.current = lives; }, [lives]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    const getBrickDimensions = useCallback((canvasWidth: number) => {
        const brickPadding = 8;
        const brickOffsetLeft = 16;
        const totalPaddingSpace = brickPadding * (BRICK_COLS - 1);
        const availableWidth = canvasWidth - brickOffsetLeft * 2 - totalPaddingSpace;
        const brickWidth = availableWidth / BRICK_COLS;
        const brickHeight = 22;
        return { brickWidth, brickHeight, brickPadding, brickOffsetLeft };
    }, []);

    const initBricks = useCallback((canvasWidth: number) => {
        const colors    = ['#FF2D78', '#FF2D78', '#FF8C42', '#FFD166', '#06D6A0', '#118AB2', '#A88BEB'];
        const hitColors = ['#FF85AD', '#FF85AD', '#FFBB88', '#FFE9A0', '#80EBD0', '#80C5E9', '#D4C2F5'];
        const { brickWidth, brickHeight, brickPadding, brickOffsetLeft } = getBrickDimensions(canvasWidth);
        const newBricks: Brick[] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                newBricks.push({
                    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                    y: r * (brickHeight + brickPadding) + 90,
                    status: r < 2 ? 2 : 1,
                    color: colors[r % colors.length],
                    hitColor: hitColors[r % hitColors.length],
                });
            }
        }
        bricks.current = newBricks;
    }, [getBrickDimensions]);

    const resetBall = useCallback((canvasWidth: number, canvasHeight: number) => {
        ballPos.current = { x: canvasWidth / 2, y: canvasHeight - 130 };
        ballDX.current = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ballDY.current = -INITIAL_BALL_SPEED;
        paddleX.current = (canvasWidth - currentPaddleWidth.current) / 2;
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
                brick.x = (i % BRICK_COLS) * (brickWidth + brickPadding) + brickOffsetLeft;
                brick.y = Math.floor(i / BRICK_COLS) * (brickHeight + brickPadding) + 90;
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
        currentPaddleWidth.current = PADDLE_WIDTH;
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
        const pw = currentPaddleWidth.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Bricks
        bricks.current.forEach(brick => {
            if (brick.status > 0) {
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brickWidth, brickHeight, 4);
                ctx.fillStyle = brick.status === 2 ? brick.color : brick.hitColor;
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.13)';
                ctx.fillRect(brick.x, brick.y, brickWidth, 8);
                if (brick.status === 2) {
                    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(brick.x + brickWidth * 0.38, brick.y + 3);
                    ctx.lineTo(brick.x + brickWidth * 0.45, brick.y + brickHeight - 3);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(brick.x + brickWidth * 0.55, brick.y + 3);
                    ctx.lineTo(brick.x + brickWidth * 0.62, brick.y + brickHeight - 3);
                    ctx.stroke();
                }
                ctx.closePath();
            }
        });

        // Level label
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,100,150,0.35)';
        ctx.textAlign = 'center';
        ctx.fillText(`LEVEL ${levelNumber}`, canvas.width / 2, 30);
        ctx.textAlign = 'left';

        // Paddle
        const paddleY = canvas.height - 80;
        const grad = ctx.createLinearGradient(paddleX.current, 0, paddleX.current + pw, 0);
        grad.addColorStop(0, '#FF2D78');
        grad.addColorStop(1, '#FF8C42');
        ctx.beginPath();
        ctx.roundRect(paddleX.current, paddleY, pw, PADDLE_HEIGHT, 5);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();

        // Ball
        ctx.beginPath();
        ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD166';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#FFD166';
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
                nextX <= paddleX.current + pw &&
                ballDY.current > 0
            ) {
                ballDY.current = -Math.abs(ballDY.current);
                const hitPos = (nextX - (paddleX.current + pw / 2)) / (pw / 2);
                ballDX.current = Math.max(-MAX_DX, Math.min(MAX_DX, ballDX.current + hitPos * 2));
                nextY = paddleY - BALL_RADIUS;
            }

            // Missed
            if (nextY - BALL_RADIUS > canvas.height) {
                const newLives = livesRef.current - 1;
                livesRef.current = newLives;
                currentPaddleWidth.current = Math.max(40, currentPaddleWidth.current - 8);
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
                if (brick.status > 0 && !hitBrick) {
                    if (
                        nextX + BALL_RADIUS > brick.x && nextX - BALL_RADIUS < brick.x + brickWidth &&
                        nextY + BALL_RADIUS > brick.y && nextY - BALL_RADIUS < brick.y + brickHeight
                    ) {
                        ballDY.current = -ballDY.current;
                        brick.status -= 1;
                        hitBrick = true;
                        scoreRef.current += brick.status === 0 ? 30 : 20;
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
        const pw = currentPaddleWidth.current;
        paddleX.current = Math.max(0, Math.min(clientX - rect.left - pw / 2, canvas.width - pw));
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
        <div className="level2-container" ref={containerRef}>
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
                        <div className="level-badge">LEVEL 2</div>
                        <h2>Heat it Up!</h2>
                        <p>⚡ Faster ball &amp; narrower paddle</p>
                        <p>🧱 Pink bricks need <strong>two hits</strong> to break</p>
                        <p>Your paddle shrinks when you miss!</p>
                        <button className="start-btn">TAP TO START</button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="game-overlay-screen">
                    <div className="overlay-content">
                        <div className="level-badge">LEVEL 2</div>
                        <h2 className="lose">Game Over!</h2>
                        <p>Score: {score}</p>
                        <button className="start-btn" onClick={onGameOver}>TRY AGAIN</button>
                    </div>
                </div>
            )}

            {gameState === 'WON' && (
                <div className="game-overlay-screen">
                    <div className="overlay-content">
                        <div className="level-badge">LEVEL 2</div>
                        <h2 className="win">🔥 Cleared!</h2>
                        <p>You smashed every brick!</p>
                        <p className="score-display">Score: {score}</p>
                        <button className="start-btn next-btn" onClick={() => onLevelComplete(score)}>
                            CONTINUE →
                        </button>
                    </div>
                </div>
            )}

            <div className="game-grid-bg"></div>
        </div>
    );
};