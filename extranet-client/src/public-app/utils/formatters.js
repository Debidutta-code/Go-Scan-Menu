export const formatPrice = (price, currency = 'USD') => {
    const currencySymbols = {
        USD: '$',
        INR: '₹',
        EUR: '€',
        GBP: '£',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${price.toFixed(2)}`;
};
export const getSpiceLevelEmoji = (spiceLevel) => {
    const levels = {
        mild: '🌶️',
        medium: '🌶️🌶️',
        hot: '🌶️🌶️🌶️',
        'extra-hot': '🌶️🌶️🌶️🌶️',
    };
    return spiceLevel ? levels[spiceLevel] || '' : '';
};
export const getDietaryIcon = (dietaryType) => {
    const icons = {
        VEG: '🟢',
        NON_VEG: '🔴',
        EGG: '🥚',
        JAIN: '🕉️',
        VEGAN: '🌱',
        GLUTEN_FREE: '🌾',
    };
    return dietaryType ? icons[dietaryType] || '' : '';
};
