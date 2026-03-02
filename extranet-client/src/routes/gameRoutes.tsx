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

export const renderGameRoutes = () => [
    <Route key="memory" path="games/memory-game" element={<MemoryGame />} />,
    <Route key="stack" path="games/stack-game" element={<StackGame />} />,
    <Route key="brick" path="games/brick-game" element={<BrickGame />} />,
    <Route key="finger" path="games/finger-pick" element={<FingerPickGame />} />,
    <Route key="fastest" path="games/fastest-finger" element={<FastestFingerGame />} />,
    <Route key="rise" path="games/rise-up" element={<RiseUpGame />} />,
    <Route key="chidiya" path="games/chidiya-udd" element={<ChidiyaUddGame />} />,
    <Route key="tictactoe" path="games/tic-tac-toe" element={<TicTacToeGame />} />,
    <Route key="galaxy" path="games/galaxy-shooter" element={<GalaxyShooter />} />,
];
