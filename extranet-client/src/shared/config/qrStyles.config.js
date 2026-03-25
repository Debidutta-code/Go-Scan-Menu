// src/config/qrStyles.config.ts
export const QR_STYLES = {
    classic: {
        name: 'Classic',
        icon: '🎨',
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'H',
        cornerStyle: 'square',
        description: 'Traditional black and white QR code',
    },
    modern: {
        name: 'Modern Blue',
        icon: '💙',
        fgColor: '#2563eb',
        bgColor: '#dbeafe',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Contemporary blue theme',
    },
    elegant: {
        name: 'Elegant Purple',
        icon: '💜',
        fgColor: '#7c3aed',
        bgColor: '#ede9fe',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Sophisticated purple palette',
    },
    vibrant: {
        name: 'Vibrant Pink',
        icon: '💗',
        fgColor: '#ec4899',
        bgColor: '#fce7f3',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Bold and eye-catching pink',
    },
    warm: {
        name: 'Warm Orange',
        icon: '🧡',
        fgColor: '#ea580c',
        bgColor: '#ffedd5',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Inviting orange tones',
    },
    fresh: {
        name: 'Fresh Mint',
        icon: '🍃',
        fgColor: '#059669',
        bgColor: '#d1fae5',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Refreshing green theme',
    },
    royal: {
        name: 'Royal Gold',
        icon: '👑',
        fgColor: '#ca8a04',
        bgColor: '#fef9c3',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Luxurious gold accents',
    },
    ocean: {
        name: 'Ocean Breeze',
        icon: '🌊',
        fgColor: '#0891b2',
        bgColor: '#cffafe',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Calming cyan waters',
    },
    sunset: {
        name: 'Sunset',
        icon: '🌅',
        fgColor: '#dc2626',
        bgColor: '#fee2e2',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Warm red sunset vibes',
    },
    forest: {
        name: 'Forest Green',
        icon: '🌲',
        fgColor: '#16a34a',
        bgColor: '#dcfce7',
        level: 'L',
        cornerStyle: 'rounded',
        description: 'Natural forest green',
    },
    minimal: {
        name: 'Minimal',
        icon: '⚪',
        fgColor: '#374151',
        bgColor: '#f9fafb',
        level: 'L',
        cornerStyle: 'square',
        description: 'Clean and simple design',
    },
    neon: {
        name: 'Neon Cyan',
        icon: '⚡',
        fgColor: '#06b6d4',
        bgColor: '#083344',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Electric neon aesthetic',
    },
    berry: {
        name: 'Berry Blast',
        icon: '🫐',
        fgColor: '#9333ea',
        bgColor: '#faf5ff',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Rich berry purple',
    },
    coffee: {
        name: 'Coffee Shop',
        icon: '☕',
        fgColor: '#78350f',
        bgColor: '#fef3c7',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Warm coffee brown',
    },
    midnight: {
        name: 'Midnight',
        icon: '🌙',
        fgColor: '#1e293b',
        bgColor: '#cbd5e1',
        level: 'H',
        cornerStyle: 'rounded',
        description: 'Dark and mysterious',
    },
};
// Helper function to get style by key
export const getQRStyle = (styleKey) => {
    return QR_STYLES[styleKey] || QR_STYLES.classic;
};
// Helper function to get all style keys
export const getQRStyleKeys = () => {
    return Object.keys(QR_STYLES);
};
// Helper function to get styles as array
export const getQRStylesArray = () => {
    return Object.entries(QR_STYLES).map(([key, config]) => ({ key, config }));
};
