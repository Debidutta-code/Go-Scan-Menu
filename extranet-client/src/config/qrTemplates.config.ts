// src/config/qrTemplates.config.ts

export interface TemplateConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'elegant' | 'modern' | 'rustic' | 'minimal' | 'luxury';
  bgGradient?: string;
  bgImage?: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  layout: 'centered' | 'top' | 'bottom' | 'split';
  showBranding: boolean;
  decorativeElements?: string[];
  qrConfig?: {
    fgColor: string;
    bgColor: string;
    level: 'L' | 'M' | 'Q' | 'H';
  };
}

export const QR_TEMPLATES: Record<string, TemplateConfig> = {
  classic_tent: {
    id: 'classic_tent',
    name: 'Classic Tent Card',
    icon: '📋',
    description: 'Traditional tent card with elegant border',
    category: 'elegant',
    bgGradient: 'linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 100%)',
    textColor: '#2c2416',
    headingFont: 'Georgia, serif',
    bodyFont: 'Arial, sans-serif',
    layout: 'centered',
    showBranding: true,
    decorativeElements: ['border-ornate'],
    qrConfig: {
      fgColor: '#2c2416',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  modern_green: {
    id: 'modern_green',
    name: 'Fresh & Modern',
    icon: '🌿',
    description: 'Clean design with leaf motif',
    category: 'modern',
    bgGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    textColor: '#1b5e20',
    headingFont: 'Helvetica, sans-serif',
    bodyFont: 'Arial, sans-serif',
    layout: 'top',
    showBranding: true,
    decorativeElements: ['leaf-corner'],
    qrConfig: {
      fgColor: '#1b5e20',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  food_photo: {
    id: 'food_photo',
    name: 'Food Photography',
    icon: '🍽️',
    description: 'Showcase your signature dish',
    category: 'modern',
    bgImage: 'https://lh3.googleusercontent.com/rd-gg-dl/AOI_d__4F-wdQZugrqyeEcdLYeW5lgHuaZTQYvad-lVCutiK1_OlQ3gupqkvT577twjXUoQRdrhc4daCoyZLFsoi6sGih2E_51ygesejwPmnzvjyspRacAyxlYjMbWwTunqlsHLV6BdJ_NGBhwYeuGKcZ2kVNfCYmCoXgMc_xVgMQHf3jrlJKYtHf-bInPD8zT3dyr1mdAAbBHPxI2gmNVRpUcNFdSn_NJiIv5DV01wlkacsKfVNJhNkIQUkI9qUT2KLsRXQunIMkCbbbs8f4woU-ZAmeQddkfvXF_iQL-IL9nna2pExyIV2iY7yyHCmHIp-nNrShUjqdhTmNuX-xK6V7_Z8mRSB5xptzfH2k0OqwbndZ0ldegvE-XEVO8WY3-p2f19DPdrTTVwLf-o2IcZx1ByGfcuMeSH9O7o2OhwNnWhSW_OuasSjvzySNrPRiB7A7dcBErci-dnJyPxURwy8m5bdGG4-NObyEE67VKy0oQKG76azbYVavsyHv5k1IIAF4yjX6U3WizfLjPmJ96VbuxdFrNvW2Ejd64-SOQQctYhQ8-S2tnb5XNC3Sga1Bg8AGEkUwMGjY4l8crS6X6V95s1I5F44f9sg1UKdXff71ZFIN9gK1vKlNyh9IbhrJONIWfqK2uV1pj494a9aG0bUo3D6H7jaKlbGTyOm8mx47vgVxKCsf9FMof9nfKOL-656vcNFRsSkpX-fu7Zt5-pnT64y5hiKUIDEbLLdUXDhj10PyysIGpS8MROIjRUhJSus68r-kKrZSwopLpwkctPFzBgACEdgYtpfJW-LIUils32_pa5yebJxTdMwRg14f0onk0ezuBXE-shRLROh-85djPJTvQ5nSPmbSIByuxSbbO_WLEgzCJp1dJqhDdOzXl3c807446mHieuwXbQ6btDAGNHdwK3IWB79-s3P4YDVQmVih2YdyKRsdFfPB4W9woyIxylwU9DzAEjCalSkCAtEfA1LSBmljWHu4cdTz2u95MzoPuwfSwQj23LAryw6ps26RNLDc9udkBQG6FjcHKQ-96JnFm-EG8dmZRz1nsjxiniPrd406TUvh7ERnM7ugCIwPsW9ueYRlukJ0JXHMkVkXCkXI_TFS_ez02CLVu0co2ASmrmb3uIDDA3sMUYdmgKswrwBnrjHsIA2wENqHuDPlKLo6PuiQ2VhtxLWyfGEWzvqEdqN9_PP=s1024-rj',
    textColor: '#ffffff',
    headingFont: 'Arial Black, sans-serif',
    bodyFont: 'Arial, sans-serif',
    layout: 'split',
    showBranding: true,
    decorativeElements: ['overlay-dark'],
    qrConfig: {
      fgColor: '#1e293b',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  rustic_kraft: {
    id: 'rustic_kraft',
    name: 'Rustic Kraft',
    icon: '📦',
    description: 'Eco-friendly kraft paper look',
    category: 'rustic',
    bgGradient: 'linear-gradient(135deg, #d7ccc8 0%, #bcaaa4 100%)',
    textColor: '#3e2723',
    headingFont: 'Courier New, monospace',
    bodyFont: 'Arial, sans-serif',
    layout: 'centered',
    showBranding: true,
    decorativeElements: ['stamp', 'texture'],
    qrConfig: {
      fgColor: '#3e2723',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  minimal_white: {
    id: 'minimal_white',
    name: 'Minimal White',
    icon: '⚪',
    description: 'Clean and simple design',
    category: 'minimal',
    bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    textColor: '#212121',
    headingFont: 'Helvetica Neue, sans-serif',
    bodyFont: 'Arial, sans-serif',
    layout: 'centered',
    showBranding: false,
    decorativeElements: [],
    qrConfig: {
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'M',
    },
  },

  luxury_gold: {
    id: 'luxury_gold',
    name: 'Luxury Gold',
    icon: '✨',
    description: 'Premium gold accents',
    category: 'luxury',
    bgGradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    textColor: '#d4af37',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Lato, sans-serif',
    layout: 'centered',
    showBranding: true,
    decorativeElements: ['gold-border', 'corner-ornate'],
    qrConfig: {
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  beach_vibes: {
    id: 'beach_vibes',
    name: 'Beach Vibes',
    icon: '🏖️',
    description: 'Relaxed coastal theme',
    category: 'modern',
    bgGradient: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
    textColor: '#006064',
    headingFont: 'Comic Sans MS, cursive',
    bodyFont: 'Arial, sans-serif',
    layout: 'top',
    showBranding: true,
    decorativeElements: ['wave-pattern'],
    qrConfig: {
      fgColor: '#006064',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  italian_bistro: {
    id: 'italian_bistro',
    name: 'Italian Bistro',
    icon: '🍕',
    description: 'Classic Italian restaurant style',
    category: 'elegant',
    bgGradient: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
    textColor: '#b71c1c',
    headingFont: 'Times New Roman, serif',
    bodyFont: 'Georgia, serif',
    layout: 'centered',
    showBranding: true,
    decorativeElements: ['italian-flag', 'chef-hat'],
    qrConfig: {
      fgColor: '#b71c1c',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  coffee_house: {
    id: 'coffee_house',
    name: 'Coffee House',
    icon: '☕',
    description: 'Warm coffee shop aesthetic',
    category: 'rustic',
    bgGradient: 'linear-gradient(135deg, #6d4c41 0%, #4e342e 100%)',
    textColor: '#ffd54f',
    headingFont: 'Brush Script MT, cursive',
    bodyFont: 'Arial, sans-serif',
    layout: 'centered',
    showBranding: true,
    decorativeElements: ['coffee-bean', 'steam'],
    qrConfig: {
      fgColor: '#4e342e',
      bgColor: '#ffffff',
      level: 'H',
    },
  },

  sushi_zen: {
    id: 'sushi_zen',
    name: 'Sushi Zen',
    icon: '🍱',
    description: 'Minimalist Japanese design',
    category: 'minimal',
    bgGradient: 'linear-gradient(135deg, #fafafa 0%, #e0e0e0 100%)',
    textColor: '#d32f2f',
    headingFont: 'Arial, sans-serif',
    bodyFont: 'Arial, sans-serif',
    layout: 'top',
    showBranding: true,
    decorativeElements: ['bamboo', 'zen-circle'],
    qrConfig: {
      fgColor: '#d32f2f',
      bgColor: '#ffffff',
      level: 'H',
    },
  },
};

// Helper functions
export const getTemplate = (templateId: string): TemplateConfig => {
  return QR_TEMPLATES[templateId] || QR_TEMPLATES.classic_tent;
};

export const getTemplatesByCategory = (category: string): TemplateConfig[] => {
  if (category === 'all') {
    return Object.values(QR_TEMPLATES);
  }
  return Object.values(QR_TEMPLATES).filter((t) => t.category === category);
};

export const getTemplatesArray = (): Array<{ key: string; config: TemplateConfig }> => {
  return Object.entries(QR_TEMPLATES).map(([key, config]) => ({ key, config }));
};

export const TEMPLATE_CATEGORIES = [
  'all',
  'elegant',
  'modern',
  'rustic',
  'minimal',
  'luxury',
] as const;
