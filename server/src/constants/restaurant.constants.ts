import { IRestaurant } from '@/models';

export const defaultTheme: IRestaurant['theme'] = {
    primaryColor: '#3B82F6',    // blue-500
    secondaryColor: '#1E293B',  // slate-800
    accentColor: '#10B981',     // emerald-500
    font: 'Inter',
    // optional fields can be undefined
    logo: undefined,
    favicon: undefined,
    bannerImage: undefined,
    customCSS: undefined,
};

export const defaultSettings: IRestaurant['defaultSettings'] = {
    currency: 'USD',
    defaultTaxIds: [],
    serviceChargePercentage: 0,
    allowBranchOverride: true,
};