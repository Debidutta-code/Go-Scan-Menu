import { Settings } from './pages/Settings';
import { TaxManagement } from '../restaurant/pages/TaxManagement';

export const settingsRoutes = [
    { path: '/staff/settings', element: <Settings /> },
    { path: '/staff/taxes', element: <TaxManagement /> },
];
