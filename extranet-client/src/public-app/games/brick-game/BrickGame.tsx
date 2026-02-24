import React, { useState } from 'react';
import './BrickGame.css';
import { Level1 } from './levels/level1/level1';
import { Level2 } from './levels/level2/level2';

// ✅ Register levels here — adding a new level in future = just add it to this array
const LEVELS = [Level1, Level2];

export const BrickGame: React.FC = () => {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);

    const handleLevelComplete = (levelScore: number) => {
        const newTotal = totalScore + levelScore;
        setTotalScore(newTotal);

        if (currentLevelIndex + 1 < LEVELS.length) {
            setCurrentLevelIndex(currentLevelIndex + 1);
        } else {
            setGameFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentLevelIndex(0);
        setTotalScore(0);
        setGameFinished(false);
    };

    if (gameFinished) {
        return (
            <div className="brick-game-container">
                <div className="game-grid-bg" />
                <div className="game-overlay-screen">
                    <div className="overlay-content">
                        <h2 className="win">🏆 All Levels Complete!</h2>
                        <p>You've beaten every level!</p>
                        <p className="final-score-label">Total Score</p>
                        <p className="final-score-value">{totalScore}</p>
                        <button className="start-btn" onClick={handleRestart}>
                            PLAY AGAIN
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const CurrentLevel = LEVELS[currentLevelIndex];

    return (
        <div className="brick-game-container">
            <CurrentLevel
                levelNumber={currentLevelIndex + 1}
                onLevelComplete={handleLevelComplete}
                onGameOver={handleRestart}
            />
        </div>
    );
};
