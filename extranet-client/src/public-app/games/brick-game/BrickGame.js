import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './BrickGame.css';
import { Level1 } from './levels/level1/level1';
import { Level2 } from './levels/level2/level2';
// ✅ Register levels here — adding a new level in future = just add it to this array
const LEVELS = [Level1, Level2];
export const BrickGame = () => {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const handleLevelComplete = (levelScore) => {
        const newTotal = totalScore + levelScore;
        setTotalScore(newTotal);
        if (currentLevelIndex + 1 < LEVELS.length) {
            setCurrentLevelIndex(currentLevelIndex + 1);
        }
        else {
            setGameFinished(true);
        }
    };
    const handleRestart = () => {
        setCurrentLevelIndex(0);
        setTotalScore(0);
        setGameFinished(false);
    };
    if (gameFinished) {
        return (_jsxs("div", { className: "brick-game-container", children: [_jsx("div", { className: "game-grid-bg" }), _jsx("div", { className: "game-overlay-screen", children: _jsxs("div", { className: "overlay-content", children: [_jsx("h2", { className: "win", children: "\uD83C\uDFC6 All Levels Complete!" }), _jsx("p", { children: "You've beaten every level!" }), _jsx("p", { className: "final-score-label", children: "Total Score" }), _jsx("p", { className: "final-score-value", children: totalScore }), _jsx("button", { className: "start-btn", onClick: handleRestart, children: "PLAY AGAIN" })] }) })] }));
    }
    const CurrentLevel = LEVELS[currentLevelIndex];
    return (_jsx("div", { className: "brick-game-container", children: _jsx(CurrentLevel, { levelNumber: currentLevelIndex + 1, onLevelComplete: handleLevelComplete, onGameOver: handleRestart }) }));
};
