// src/services/qrconfig.service.ts
import { QRConfig, IQRConfig } from '@/models/QRConfig.model';
import { AppError } from '@/utils/AppError';

export class QRConfigService {
  async getQRConfig(restaurantId: string): Promise<IQRConfig | null> {
    const config = await QRConfig.findOne({ restaurantId, isActive: true });
    return config;
  }

  async createOrUpdateQRConfig(restaurantId: string, data: Partial<IQRConfig>): Promise<IQRConfig> {
    // Check if config exists
    const existingConfig = await QRConfig.findOne({ restaurantId });

    if (existingConfig) {
      // Update existing config
      Object.assign(existingConfig, data);
      await existingConfig.save();
      return existingConfig;
    }

    // Create new config
    const newConfig = new QRConfig({
      restaurantId,
      ...data,
    });

    await newConfig.save();
    return newConfig;
  }

  async deleteQRConfig(restaurantId: string): Promise<IQRConfig | null> {
    const config = await QRConfig.findOneAndUpdate(
      { restaurantId },
      { isActive: false },
      { new: true }
    );

    if (!config) {
      throw new AppError('QR Config not found', 404);
    }

    return config;
  }

  async resetQRConfig(restaurantId: string): Promise<IQRConfig> {
    // Delete existing and create default
    await QRConfig.findOneAndDelete({ restaurantId });

    const defaultConfig = new QRConfig({
      restaurantId,
      designMode: 'simple',
      selectedStyle: 'classic',
      selectedTemplate: 'classic_tent',
      customMode: false,
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'H',
      selectedCategory: 'all',
      isActive: true,
    });

    await defaultConfig.save();
    return defaultConfig;
  }
}
