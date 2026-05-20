import { Settings } from './pages/Settings';
import { TaxManagement } from '../restaurant/pages/tax-management/TaxManagement';

export const settingsRoutes = [
    { path: '/staff/settings', element: <Settings /> },
    { path: '/staff/taxes', element: <TaxManagement /> },
];
