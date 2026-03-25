import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import './TicTacToeGame.css';
const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6], // diags
];
const checkWinner = (board) => {
    for (const line of WIN_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line };
        }
    }
    return null;
};
export const TicTacToeGame = () => {
    const [phase, setPhase] = useState('IDLE');
    const [board, setBoard] = useState(Array(9).fill(null));
    const [turn, setTurn] = useState('X');
    const [winResult, setWinResult] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0 });
    const [lastCellAnim, setLastCellAnim] = useState(null);
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
    const handleCellTap = useCallback((idx) => {
        if (phase !== 'PLAYING')
            return;
        if (board[idx])
            return;
        const newBoard = [...board];
        newBoard[idx] = turn;
        setLastCellAnim(idx);
        setBoard(newBoard);
        const result = checkWinner(newBoard);
        if (result) {
            setWinResult(result);
            setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
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
    return (_jsxs("div", { className: "ttt-container", children: [_jsxs("div", { className: `ttt-player-strip ttt-top ${isTopTurn ? 'ttt-strip--active' : ''} ${winResult?.winner === 'X' ? 'ttt-strip--winner' : ''} ${winResult?.winner === 'O' || (isDraw && phase === 'RESULT') ? 'ttt-strip--loser' : ''}`, children: [_jsxs("div", { className: "ttt-strip-inner rotated", children: [_jsx("div", { className: "ttt-strip-symbol ttt-x-symbol", children: scores.X }), _jsx("div", { className: "ttt-strip-mark ttt-x-mark", children: "\u2715" }), _jsx("div", { className: "ttt-strip-label", children: phase === 'PLAYING' ? (isTopTurn ? '— YOUR TURN —' : 'waiting...') :
                                    phase === 'RESULT' ? (winResult?.winner === 'X' ? '🏆 YOU WIN!' : isDraw ? 'DRAW' : 'you lose') :
                                        'PLAYER X' })] }), isTopTurn && _jsx("div", { className: "ttt-turn-glow ttt-turn-glow--x" })] }), _jsxs("div", { className: "ttt-middle", children: [phase === 'IDLE' && (_jsxs("div", { className: "ttt-idle-card", children: [_jsxs("div", { className: "ttt-idle-marks", children: [_jsx("span", { className: "ttt-x-mark", children: "\u2715" }), _jsx("span", { className: "ttt-idle-vs", children: "VS" }), _jsx("span", { className: "ttt-o-mark", children: "\u25CB" })] }), _jsx("h1", { className: "ttt-title", children: "TIC TAC TOE" }), _jsx("p", { className: "ttt-subtitle", children: "2 Player \u00B7 Top is X \u00B7 Bottom is O" }), _jsx("button", { className: "ttt-btn", onClick: startGame, children: "START GAME" })] })), (phase === 'PLAYING' || phase === 'RESULT') && (_jsxs("div", { className: "ttt-board-wrap", children: [phase === 'PLAYING' && (_jsxs("div", { className: `ttt-turn-bar ${turn === 'X' ? 'ttt-turn-bar--x' : 'ttt-turn-bar--o'}`, children: [_jsx("span", { className: turn === 'X' ? 'ttt-x-mark' : 'ttt-o-mark', children: turn === 'X' ? '✕' : '○' }), _jsx("span", { children: turn === 'X' ? "TOP's Turn" : "BOTTOM's Turn" })] })), phase === 'RESULT' && (_jsx("div", { className: `ttt-result-banner ${winResult ? (winResult.winner === 'X' ? 'ttt-res--x' : 'ttt-res--o') : 'ttt-res--draw'}`, children: isDraw ? "🤝 IT'S A DRAW!" :
                                    winResult?.winner === 'X' ? '✕ TOP WINS!' : '○ BOTTOM WINS!' })), _jsx("div", { className: "ttt-board", children: board.map((cell, idx) => {
                                    const isWinCell = winResult?.line.includes(idx);
                                    const isNew = lastCellAnim === idx;
                                    return (_jsxs("div", { className: `ttt-cell
                                            ${cell ? 'ttt-cell--filled' : phase === 'PLAYING' ? 'ttt-cell--empty' : ''}
                                            ${isWinCell ? 'ttt-cell--win' : ''}
                                            ${!cell && phase === 'PLAYING' && turn === 'X' ? 'ttt-cell--hover-x' : ''}
                                            ${!cell && phase === 'PLAYING' && turn === 'O' ? 'ttt-cell--hover-o' : ''}
                                        `, onClick: () => handleCellTap(idx), children: [cell === 'X' && (_jsx("span", { className: `ttt-x-mark ttt-cell-mark ${isNew ? 'ttt-mark-pop' : ''} ${isWinCell ? 'ttt-mark-glow-x' : ''}`, children: "\u2715" })), cell === 'O' && (_jsx("span", { className: `ttt-o-mark ttt-cell-mark ${isNew ? 'ttt-mark-pop' : ''} ${isWinCell ? 'ttt-mark-glow-o' : ''}`, children: "\u25CB" }))] }, idx));
                                }) }), _jsxs("div", { className: "ttt-score-row", children: [_jsxs("div", { className: "ttt-score-item", children: [_jsx("span", { className: "ttt-x-mark", children: "\u2715" }), _jsx("strong", { className: "ttt-x-score", children: scores.X })] }), _jsx("div", { className: "ttt-score-divider", children: "\u00B7" }), _jsxs("div", { className: "ttt-score-item", children: [_jsx("span", { className: "ttt-o-mark", children: "\u25CB" }), _jsx("strong", { className: "ttt-o-score", children: scores.O })] })] }), phase === 'RESULT' && (_jsxs("div", { className: "ttt-action-row", children: [_jsx("button", { className: "ttt-btn ttt-btn--sm", onClick: resetRound, children: "\u21BA NEXT ROUND" }), _jsx("button", { className: "ttt-btn ttt-btn--sm ttt-btn--ghost", onClick: fullReset, children: "\u2715 RESET ALL" })] }))] }))] }), _jsxs("div", { className: `ttt-player-strip ttt-bottom ${isBottomTurn ? 'ttt-strip--active' : ''} ${winResult?.winner === 'O' ? 'ttt-strip--winner' : ''} ${winResult?.winner === 'X' || (isDraw && phase === 'RESULT') ? 'ttt-strip--loser' : ''}`, children: [_jsxs("div", { className: "ttt-strip-inner", children: [_jsx("div", { className: "ttt-strip-symbol ttt-o-symbol", children: scores.O }), _jsx("div", { className: "ttt-strip-mark ttt-o-mark", children: "\u25CB" }), _jsx("div", { className: "ttt-strip-label", children: phase === 'PLAYING' ? (isBottomTurn ? '— YOUR TURN —' : 'waiting...') :
                                    phase === 'RESULT' ? (winResult?.winner === 'O' ? '🏆 YOU WIN!' : isDraw ? 'DRAW' : 'you lose') :
                                        'PLAYER O' })] }), isBottomTurn && _jsx("div", { className: "ttt-turn-glow ttt-turn-glow--o" })] }), _jsx("div", { className: "ttt-scanlines" })] }));
};
