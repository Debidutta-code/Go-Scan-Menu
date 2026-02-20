import React, { useEffect, useRef, useState, useCallback } from 'react';
import './RiseUpGame.css';

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'WIN';

interface Point { x: number; y: number; }

class BaseObject {
    x: number; y: number; vx: number = 0; vy: number = 0; mass: number = 1;
    constructor(x: number, y: number) { this.x = x; this.y = y; }
    update() { this.x += this.vx; this.y += this.vy; this.vx *= 0.98; this.vy *= 0.98; }
}

class Circle extends BaseObject {
    radius: number; color: string;
    constructor(x: number, y: number, radius: number, color: string) {
        super(x, y); this.radius = radius; this.color = color;
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill(); ctx.closePath();
    }
}

class Rect extends BaseObject {
    width: number; height: number; color: string;
    constructor(x: number, y: number, width: number, height: number, color: string) {
        super(x, y); this.width = width; this.height = height; this.color = color;
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color; ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

const SHIELD_RADIUS = 25;
const BALLOON_RADIUS = 20;

export const RiseUpGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>('START');
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const requestRef = useRef<number | undefined>(undefined);

    // Game entities
    const shieldRef = useRef<Circle>(new Circle(0, 0, SHIELD_RADIUS, 'white'));
    const balloonRef = useRef<Circle>(new Circle(0, 0, BALLOON_RADIUS, 'yellow'));
    const obstaclesRef = useRef<(Circle | Rect)[]>([]);
    const pointerRef = useRef<Point>({ x: 0, y: 0 });

    const scrollSpeedRef = useRef(1);
    const distanceRef = useRef(0);

    const initLevel = useCallback((lvl: number) => {
        const obstacles: (Circle | Rect)[] = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        distanceRef.current = 0;
        scrollSpeedRef.current = 1 + lvl * 0.5;

        // Generate level obstacles based on level index
        if (lvl === 1) {
            for (let i = 0; i < 20; i++) {
                obstacles.push(new Circle(Math.random() * w, -i * 150 - 500, 15 + Math.random() * 15, 'white'));
            }
        } else if (lvl === 2) {
            for (let i = 0; i < 15; i++) {
                obstacles.push(new Rect(w / 2, -i * 200 - 500, w * 0.6, 20, 'white'));
            }
        } else if (lvl === 3) {
            for (let i = 0; i < 30; i++) {
                const x = (i % 2 === 0) ? w * 0.2 : w * 0.8;
                obstacles.push(new Circle(x, -i * 100 - 500, 20, 'white'));
            }
        } else {
            for (let i = 0; i < 40; i++) {
                obstacles.push(new Circle(Math.random() * w, -i * 80 - 500, 10 + Math.random() * 10, 'white'));
                if (i % 5 === 0) obstacles.push(new Rect(Math.random() * w, -i * 80 - 500, 40, 40, 'white'));
            }
        }

        obstaclesRef.current = obstacles;
    }, []);

    const resetGame = () => {
        setScore(0);
        setLevel(1);
        setGameState('PLAYING');
        initLevel(1);
        shieldRef.current.x = window.innerWidth / 2;
        shieldRef.current.y = window.innerHeight * 0.7;
        pointerRef.current = { x: shieldRef.current.x, y: shieldRef.current.y };
        balloonRef.current.x = window.innerWidth / 2;
        balloonRef.current.y = window.innerHeight * 0.85;
    };

    const update = useCallback(() => {
        if (gameState !== 'PLAYING') return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Smooth shield follow
        const dx = pointerRef.current.x - shieldRef.current.x;
        const dy = pointerRef.current.y - shieldRef.current.y;
        shieldRef.current.vx = dx * 0.3;
        shieldRef.current.vy = dy * 0.3;
        shieldRef.current.update();

        // Level scrolling and scoring
        distanceRef.current += scrollSpeedRef.current;
        setScore(Math.floor(distanceRef.current / 10));

        // Update obstacles
        obstaclesRef.current.forEach(obj => {
            obj.y += scrollSpeedRef.current;
            obj.update();

            // Collision: Shield vs Obstacle
            const distShield = Math.sqrt((obj.x - shieldRef.current.x) ** 2 + (obj.y - shieldRef.current.y) ** 2);
            if (distShield < SHIELD_RADIUS + (obj instanceof Circle ? obj.radius : obj.width / 2)) {
                const angle = Math.atan2(obj.y - shieldRef.current.y, obj.x - shieldRef.current.x);
                const force = 10;
                obj.vx = Math.cos(angle) * force;
                obj.vy = Math.sin(angle) * force;
            }

            // Collision: Balloon vs Obstacle
            const distBalloon = Math.sqrt((obj.x - balloonRef.current.x) ** 2 + (obj.y - balloonRef.current.y) ** 2);
            const r = obj instanceof Circle ? obj.radius : obj.width / 2;
            if (distBalloon < BALLOON_RADIUS + r * 0.8) {
                setGameState('GAMEOVER');
            }
        });

        // Level completion check
        if (obstaclesRef.current.every(obj => obj.y > h + 100)) {
            if (level < 4) {
                setLevel(prev => prev + 1);
                initLevel(level + 1);
            } else {
                setGameState('WIN');
            }
        }

        // Cleanup out of bounds
        // (Optional: remove obstacles far below screen)
    }, [gameState, level, initLevel]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw Balloon String
        ctx.beginPath();
        ctx.moveTo(balloonRef.current.x, balloonRef.current.y + 15);
        ctx.lineTo(balloonRef.current.x, ctx.canvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();

        // Draw Balloon
        balloonRef.current.draw(ctx);

        // Draw Obstacles
        obstaclesRef.current.forEach(obj => obj.draw(ctx));

        // Draw Shield
        shieldRef.current.draw(ctx);
    }, []);

    const loop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        update();
        draw(ctx);
        requestRef.current = requestAnimationFrame(loop);
    }, [update, draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        requestRef.current = requestAnimationFrame(loop);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [loop]);

    const handlePointer = (e: React.PointerEvent) => {
        if (gameState !== 'PLAYING') return;
        pointerRef.current = { x: e.clientX, y: e.clientY };
    };

    return (
        <div className="rise-up-container" onPointerMove={handlePointer} onTouchMove={(e) => {
            const touch = e.touches[0];
            pointerRef.current = { x: touch.clientX, y: touch.clientY };
        }}>
            <canvas ref={canvasRef} className="rise-up-canvas" />

            <div className="game-ui">
                <div className="score-box">
                    <h3>Score</h3>
                    <p>{score}</p>
                </div>
                <div className="level-box">
                    <h3>Level</h3>
                    <p>{level}/4</p>
                </div>
            </div>

            {gameState === 'START' && (
                <div className="game-overlay">
                    <h1>RISE UP</h1>
                    <p>Protect the balloon from objects!</p>
                    <button className="start-btn" onClick={resetGame}>START GAME</button>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="game-overlay">
                    <h1>POPPED!</h1>
                    <p>Final Score: {score}</p>
                    <button className="retry-btn" onClick={resetGame}>TRY AGAIN</button>
                </div>
            )}

            {gameState === 'WIN' && (
                <div className="game-overlay">
                    <h1>VICTORY!</h1>
                    <p>You protected the balloon!</p>
                    <button className="retry-btn" onClick={resetGame}>PLAY AGAIN</button>
                </div>
            )}

            <div className="status-text">{gameState === 'PLAYING' ? `Level ${level}` : ''}</div>
        </div>
    );
};
