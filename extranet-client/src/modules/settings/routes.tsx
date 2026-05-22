import { Settings } from './pages/Settings';
import { TaxManagement } from '../restaurant/pages/tax-management/TaxManagement';
import { ReviewsAndRatings } from '../restaurant/pages/ReviewsAndRatings/ReviewsAndRatings';

export const settingsRoutes = [
    { path: '/staff/settings', element: <Settings /> },
    { path: '/staff/taxes', element: <TaxManagement /> },
    { path: '/staff/reviews', element: <ReviewsAndRatings /> },
];
