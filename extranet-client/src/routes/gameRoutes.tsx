import React from 'react';
import { Route } from 'react-router-dom';
import { GamesManagement as MemoryGame } from '../public-app/games/memory-game/GamesManagement';
import { StackGame } from '@/public-app/games/stack-game/StackGame';
import { BrickGame } from '@/public-app/games/brick-game/BrickGame';
import { FingerPickGame } from '../public-app/games/random-finger-pick/FingerPickGame';
import { FastestFingerGame } from '../public-app/games/fastest-finger/FastestFingerGame';
import { RiseUpGame } from '../public-app/games/rise-up/RiseUpGame';
import { ChidiyaUddGame } from '../public-app/games/chidiya-udd/ChidiyaUddGame';
import { TicTacToeGame } from '../public-app/games/tic-tac-toe/TicTacToeGame';
import { GalaxyShooter } from '../public-app/games/galaxy-shooter/GalaxyShooter';

export const GameRoutes = () => {
    return (
        <>
            <Route path="games/memory-game" element={<MemoryGame />} />
            <Route path="games/stack-game" element={<StackGame />} />
            <Route path="games/brick-game" element={<BrickGame />} />
            <Route path="games/finger-pick" element={<FingerPickGame />} />
            <Route path="games/fastest-finger" element={<FastestFingerGame />} />
            <Route path="games/rise-up" element={<RiseUpGame />} />
            <Route path="games/chidiya-udd" element={<ChidiyaUddGame />} />
            <Route path="games/tic-tac-toe" element={<TicTacToeGame />} />
            <Route path="games/galaxy-shooter" element={<GalaxyShooter />} />
        </>
    );
};
