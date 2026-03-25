import { jsx as _jsx } from "react/jsx-runtime";
import { Route } from 'react-router-dom';
import { GamesManagement as MemoryGame } from '@/public-app/games/memory-game/GamesManagement';
import { StackGame } from '@/public-app/games/stack-game/StackGame';
import { BrickGame } from '@/public-app/games/brick-game/BrickGame';
import { FingerPickGame } from '@/public-app/games/random-finger-pick/FingerPickGame';
import { FastestFingerGame } from '@/public-app/games/fastest-finger/FastestFingerGame';
import { RiseUpGame } from '@/public-app/games/rise-up/RiseUpGame';
import { ChidiyaUddGame } from '@/public-app/games/chidiya-udd/ChidiyaUddGame';
import { TicTacToeGame } from '@/public-app/games/tic-tac-toe/TicTacToeGame';
import { GalaxyShooter } from '@/public-app/games/galaxy-shooter/GalaxyShooter';
export const renderGameRoutes = () => [
    _jsx(Route, { path: "games/memory-game", element: _jsx(MemoryGame, {}) }, "memory"),
    _jsx(Route, { path: "games/stack-game", element: _jsx(StackGame, {}) }, "stack"),
    _jsx(Route, { path: "games/brick-game", element: _jsx(BrickGame, {}) }, "brick"),
    _jsx(Route, { path: "games/finger-pick", element: _jsx(FingerPickGame, {}) }, "finger"),
    _jsx(Route, { path: "games/fastest-finger", element: _jsx(FastestFingerGame, {}) }, "fastest"),
    _jsx(Route, { path: "games/rise-up", element: _jsx(RiseUpGame, {}) }, "rise"),
    _jsx(Route, { path: "games/chidiya-udd", element: _jsx(ChidiyaUddGame, {}) }, "chidiya"),
    _jsx(Route, { path: "games/tic-tac-toe", element: _jsx(TicTacToeGame, {}) }, "tictactoe"),
    _jsx(Route, { path: "games/galaxy-shooter", element: _jsx(GalaxyShooter, {}) }, "galaxy"),
];
