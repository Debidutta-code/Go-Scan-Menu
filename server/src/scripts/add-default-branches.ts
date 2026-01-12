// scripts/add-default-branches.ts
// This script adds default branches to existing single restaurants that don't have any branches

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.model';
import { Branch } from '../models/Branch.model';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/go-scan-menu';

async function addDefaultBranches() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all single restaurants
    const singleRestaurants = await Restaurant.find({ type: 'single' });
    console.log(`📊 Found ${singleRestaurants.length} single restaurant(s)`);

    for (const restaurant of singleRestaurants) {
      // Check if this restaurant already has branches
      const existingBranches = await Branch.find({ restaurantId: restaurant._id });

      if (existingBranches.length === 0) {
        console.log(`🏪 Creating default branch for: ${restaurant.name}`);

        // Create default branch
        const defaultBranch = await Branch.create({
          restaurantId: restaurant._id,
          name: `${restaurant.name} - Main Location`,
          code: 'MAIN',
          email: restaurant.owner.email,
          phone: restaurant.owner.phone,
          address: {
            street: 'Main Street',
            city: 'City',
            state: 'State',
            zipCode: '00000',
            country: 'Country',
            coordinates: {
              latitude: 0,
              longitude: 0,
            },
          },
          settings: {
            currency: restaurant.defaultSettings.currency || 'USD',
            taxIds: [],
            serviceChargePercentage: restaurant.defaultSettings.serviceChargePercentage || 0,
            acceptOrders: true,
            operatingHours: [
              { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
              { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
              { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
              { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
              { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
              { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
              { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
            ],
            minOrderAmount: 0,
            deliveryAvailable: false,
            takeawayAvailable: true,
          },
          isActive: true,
        });

        // Update restaurant's currentBranches count
        await Restaurant.findByIdAndUpdate(restaurant._id, {
          $set: {
            'subscription.currentBranches': 1,
          },
        });

        console.log(`   ✅ Created branch: ${defaultBranch.name} (ID: ${defaultBranch._id})`);
        console.log(`   ✅ Updated currentBranches count to 1`);
      } else {
        console.log(`⏭️  Restaurant \"${restaurant.name}\" already has ${existingBranches.length} branch(es), skipping...`);
      }
    }

    console.log('✨ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addDefaultBranches();
