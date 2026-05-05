import { BranchSelection } from './pages/BranchSelection';
import { BranchSettings } from './pages/BranchSettings';

export const branchRoutes = [
    { path: '/staff/tables', element: <BranchSelection /> },
    { path: '/staff/branch-settings', element: <BranchSettings /> },
];
