import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './StackGame.css';

interface Block {
    id: number;
    x: number;
    width: number;
    isBase?: boolean;
}

const GAME_WIDTH = 100; // Percentage based
const BLOCK_HEIGHT = 50; // Pixels
const INITIAL_WIDTH = 40; // Percentage
const SWING_SPEED = 1.5;

export const StackGame: React.FC = () => {
    const navigate = useNavigate();
    const [blocks, setBlocks] = useState<Block[]>([{ id: 0, x: 30, width: INITIAL_WIDTH, isBase: true }]);
    const [currentX, setCurrentX] = useState(0);
    const directionRef = useRef(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const requestRef = useRef<number>(null);
    const gameContainerRef = useRef<HTMLDivElement>(null);

    const swing = useCallback(() => {
        const lastBlock = blocks[blocks.length - 1];
        const currentBlockWidth = lastBlock.width;

        setCurrentX(prev => {
            let next = prev + (directionRef.current * SWING_SPEED);

            if (next > (GAME_WIDTH - currentBlockWidth)) {
                next = GAME_WIDTH - currentBlockWidth;
                directionRef.current = -1;
            } else if (next < 0) {
                next = 0;
                directionRef.current = 1;
            }
            return next;
        });
        requestRef.current = requestAnimationFrame(swing);
    }, [blocks]);

    useEffect(() => {
        if (gameStarted && !isGameOver) {
            requestRef.current = requestAnimationFrame(swing);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameStarted, isGameOver, swing]);

    const handleDrop = () => {
        if (!gameStarted) {
            setGameStarted(true);
            return;
        }
        if (isGameOver) return;

        const lastBlock = blocks[blocks.length - 1];
        const dropX = currentX;
        const currentWidth = lastBlock.width;

        // Detect collision/overlap
        const overlapStart = Math.max(dropX, lastBlock.x);
        const overlapEnd = Math.min(dropX + currentWidth, lastBlock.x + lastBlock.width);
        const newWidth = overlapEnd - overlapStart;

        if (newWidth > 0) {
            const newBlock: Block = {
                id: blocks.length,
                x: overlapStart,
                width: newWidth
            };
            setBlocks([...blocks, newBlock]);
            setScore(s => s + 1);

            // Speed up a bit? No, keep it simple for now.
        } else {
            setIsGameOver(true);
        }
    };

    const restartGame = () => {
        setBlocks([{ id: 0, x: 30, width: INITIAL_WIDTH, isBase: true }]);
        setCurrentX(0);
        directionRef.current = 1;
        setIsGameOver(false);
        setScore(0);
        setGameStarted(false);
    };

    return (
        <div className="stack-game-container" onClick={handleDrop}>
            <div className="game-overlay">
                <header className="stack-header">
                    <button className="back-btn" onClick={(e) => { e.stopPropagation(); navigate(-1); }}>←</button>
                    <div className="stack-score">
                        <span className="score-label">HEIGHT</span>
                        <span className="score-value">{score}</span>
                    </div>
                    <div className="header-spacer"></div>
                </header>

                <div className="sky-background">
                    <div className="sun"></div>
                    <div className="cloud cloud-1"></div>
                    <div className="cloud cloud-2"></div>
                </div>

                <div className="crane-system" style={{ transform: `translateY(${-score * BLOCK_HEIGHT}px)` }}>
                    {!isGameOver && gameStarted && (
                        <div className="swinging-arm">
                            <div className="crane-rope"></div>
                            <div className="active-block" style={{
                                left: `${currentX}%`,
                                width: `${blocks[blocks.length - 1].width}%`
                            }}>
                                <div className="block-windows"></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="tower-container" style={{ transform: `translateY(${-score * BLOCK_HEIGHT + 200}px)` }}>
                    {blocks.map((block, index) => (
                        <div
                            key={block.id}
                            className={`block ${block.isBase ? 'base-block' : ''}`}
                            style={{
                                left: `${block.x}%`,
                                width: `${block.width}%`,
                                bottom: `${index * BLOCK_HEIGHT}px`
                            }}
                        >
                            {!block.isBase && <div className="block-windows"></div>}
                            {block.isBase && <div className="base-door"></div>}
                        </div>
                    ))}
                </div>

                {!gameStarted && !isGameOver && (
                    <div className="start-screen">
                        <h1>Tower Builder</h1>
                        <p>Tap to start and drop blocks</p>
                        <div className="demo-block"></div>
                    </div>
                )}

                {isGameOver && (
                    <div className="game-over-overlay">
                        <div className="over-content">
                            <h2>Tower Collapsed!</h2>
                            <p>You reached {score} floors</p>
                            <button onClick={(e) => { e.stopPropagation(); restartGame(); }}>Try Again</button>
                        </div>
                    </div>
                )}

                <div className="ground"></div>
            </div>
        </div>
    );
};
