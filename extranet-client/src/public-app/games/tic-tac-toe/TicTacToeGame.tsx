import React, { useState, useCallback } from 'react';
import './TicTacToeGame.css';

type Cell = 'X' | 'O' | null;
type GamePhase = 'IDLE' | 'PLAYING' | 'RESULT';

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],             // diags
];

const checkWinner = (board: Cell[]): { winner: Cell; line: number[] } | null => {
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line };
        }
    }
    return null;
};

export const TicTacToeGame: React.FC = () => {
    const [phase, setPhase] = useState<GamePhase>('IDLE');
    const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
    const [turn, setTurn] = useState<'X' | 'O'>('X');
    const [winResult, setWinResult] = useState<{ winner: Cell; line: number[] } | null>(null);
    const [isDraw, setIsDraw] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0 });
    const [lastCellAnim, setLastCellAnim] = useState<number | null>(null);

    const startGame = () => {
        setBoard(Array(9).fill(null));
        setTurn('X');
        setWinResult(null);
        setIsDraw(false);
        setLastCellAnim(null);
        setPhase('PLAYING');
    };

    const resetRound = () => {
        setBoard(Array(9).fill(null));
        setTurn('X');
        setWinResult(null);
        setIsDraw(false);
        setLastCellAnim(null);
        setPhase('PLAYING');
    };

    const fullReset = () => {
        setScores({ X: 0, O: 0 });
        setBoard(Array(9).fill(null));
        setTurn('X');
        setWinResult(null);
        setIsDraw(false);
        setLastCellAnim(null);
        setPhase('IDLE');
    };

    const handleCellTap = useCallback((idx: number) => {
        if (phase !== 'PLAYING') return;
        if (board[idx]) return;

        const newBoard = [...board];
        newBoard[idx] = turn;
        setLastCellAnim(idx);
        setBoard(newBoard);

        const result = checkWinner(newBoard);
        if (result) {
            setWinResult(result);
            setScores(prev => ({ ...prev, [result.winner!]: prev[result.winner as 'X' | 'O'] + 1 }));
            setPhase('RESULT');
            return;
        }
        if (newBoard.every(c => c !== null)) {
            setIsDraw(true);
            setPhase('RESULT');
            return;
        }
        setTurn(t => t === 'X' ? 'O' : 'X');
    }, [phase, board, turn]);

    const isTopTurn = turn === 'X' && phase === 'PLAYING';
    const isBottomTurn = turn === 'O' && phase === 'PLAYING';

    return (
        <div className="ttt-container">

            {/* ── TOP PLAYER (X) — rotated ── */}
            <div className={`ttt-player-strip ttt-top ${isTopTurn ? 'ttt-strip--active' : ''} ${winResult?.winner === 'X' ? 'ttt-strip--winner' : ''} ${winResult?.winner === 'O' || (isDraw && phase === 'RESULT') ? 'ttt-strip--loser' : ''}`}>
                <div className="ttt-strip-inner rotated">
                    <div className="ttt-strip-symbol ttt-x-symbol">{scores.X}</div>
                    <div className="ttt-strip-mark ttt-x-mark">✕</div>
                    <div className="ttt-strip-label">
                        {phase === 'PLAYING' ? (isTopTurn ? '— YOUR TURN —' : 'waiting...') :
                         phase === 'RESULT' ? (winResult?.winner === 'X' ? '🏆 YOU WIN!' : isDraw ? 'DRAW' : 'you lose') :
                         'PLAYER X'}
                    </div>
                </div>
                {isTopTurn && <div className="ttt-turn-glow ttt-turn-glow--x" />}
            </div>

            {/* ── MIDDLE: BOARD ── */}
            <div className="ttt-middle">

                {phase === 'IDLE' && (
                    <div className="ttt-idle-card">
                        <div className="ttt-idle-marks">
                            <span className="ttt-x-mark">✕</span>
                            <span className="ttt-idle-vs">VS</span>
                            <span className="ttt-o-mark">○</span>
                        </div>
                        <h1 className="ttt-title">TIC TAC TOE</h1>
                        <p className="ttt-subtitle">2 Player · Top is X · Bottom is O</p>
                        <button className="ttt-btn" onClick={startGame}>START GAME</button>
                    </div>
                )}

                {(phase === 'PLAYING' || phase === 'RESULT') && (
                    <div className="ttt-board-wrap">

                        {/* Turn indicator bar */}
                        {phase === 'PLAYING' && (
                            <div className={`ttt-turn-bar ${turn === 'X' ? 'ttt-turn-bar--x' : 'ttt-turn-bar--o'}`}>
                                <span className={turn === 'X' ? 'ttt-x-mark' : 'ttt-o-mark'}>
                                    {turn === 'X' ? '✕' : '○'}
                                </span>
                                <span>{turn === 'X' ? "TOP's Turn" : "BOTTOM's Turn"}</span>
                            </div>
                        )}

                        {/* Result banner */}
                        {phase === 'RESULT' && (
                            <div className={`ttt-result-banner ${winResult ? (winResult.winner === 'X' ? 'ttt-res--x' : 'ttt-res--o') : 'ttt-res--draw'}`}>
                                {isDraw ? "🤝 IT'S A DRAW!" :
                                 winResult?.winner === 'X' ? '✕ TOP WINS!' : '○ BOTTOM WINS!'}
                            </div>
                        )}

                        {/* Board */}
                        <div className="ttt-board">
                            {board.map((cell, idx) => {
                                const isWinCell = winResult?.line.includes(idx);
                                const isNew = lastCellAnim === idx;
                                return (
                                    <div
                                        key={idx}
                                        className={`ttt-cell
                                            ${cell ? 'ttt-cell--filled' : phase === 'PLAYING' ? 'ttt-cell--empty' : ''}
                                            ${isWinCell ? 'ttt-cell--win' : ''}
                                            ${!cell && phase === 'PLAYING' && turn === 'X' ? 'ttt-cell--hover-x' : ''}
                                            ${!cell && phase === 'PLAYING' && turn === 'O' ? 'ttt-cell--hover-o' : ''}
                                        `}
                                        onClick={() => handleCellTap(idx)}
                                    >
                                        {cell === 'X' && (
                                            <span className={`ttt-x-mark ttt-cell-mark ${isNew ? 'ttt-mark-pop' : ''} ${isWinCell ? 'ttt-mark-glow-x' : ''}`}>✕</span>
                                        )}
                                        {cell === 'O' && (
                                            <span className={`ttt-o-mark ttt-cell-mark ${isNew ? 'ttt-mark-pop' : ''} ${isWinCell ? 'ttt-mark-glow-o' : ''}`}>○</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Score row */}
                        <div className="ttt-score-row">
                            <div className="ttt-score-item">
                                <span className="ttt-x-mark">✕</span>
                                <strong className="ttt-x-score">{scores.X}</strong>
                            </div>
                            <div className="ttt-score-divider">·</div>
                            <div className="ttt-score-item">
                                <span className="ttt-o-mark">○</span>
                                <strong className="ttt-o-score">{scores.O}</strong>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {phase === 'RESULT' && (
                            <div className="ttt-action-row">
                                <button className="ttt-btn ttt-btn--sm" onClick={resetRound}>↺ NEXT ROUND</button>
                                <button className="ttt-btn ttt-btn--sm ttt-btn--ghost" onClick={fullReset}>✕ RESET ALL</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── BOTTOM PLAYER (O) ── */}
            <div className={`ttt-player-strip ttt-bottom ${isBottomTurn ? 'ttt-strip--active' : ''} ${winResult?.winner === 'O' ? 'ttt-strip--winner' : ''} ${winResult?.winner === 'X' || (isDraw && phase === 'RESULT') ? 'ttt-strip--loser' : ''}`}>
                <div className="ttt-strip-inner">
                    <div className="ttt-strip-symbol ttt-o-symbol">{scores.O}</div>
                    <div className="ttt-strip-mark ttt-o-mark">○</div>
                    <div className="ttt-strip-label">
                        {phase === 'PLAYING' ? (isBottomTurn ? '— YOUR TURN —' : 'waiting...') :
                         phase === 'RESULT' ? (winResult?.winner === 'O' ? '🏆 YOU WIN!' : isDraw ? 'DRAW' : 'you lose') :
                         'PLAYER O'}
                    </div>
                </div>
                {isBottomTurn && <div className="ttt-turn-glow ttt-turn-glow--o" />}
            </div>

            <div className="ttt-scanlines" />
        </div>
    );
};