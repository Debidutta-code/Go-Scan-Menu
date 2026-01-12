// scripts/seed-test-data.ts
// Seed script to create test superadmin and a single restaurant with default branch

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { SuperAdmin } from '../models/SuperAdmin.model';
import { Restaurant } from '../models/Restaurant.model';
import { Branch } from '../models/Branch.model';
import { Staff } from '../models/Staff.model';
import { StaffTypePermissions, StaffType } from '../models/StaffTypePermissions.model';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-extranet';

async function seedTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create SuperAdmin
    console.log('👤 Creating SuperAdmin...');
    const existingSuperAdmin = await SuperAdmin.findOne({ email: 'admin@test.com' });
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await SuperAdmin.create({
        name: 'Super Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        isActive: true,
      });
      console.log('   ✅ SuperAdmin created: admin@test.com / password123');
    } else {
      console.log('   ⏭️  SuperAdmin already exists');
    }

    // 2. Create Single Restaurant
    console.log('🏪 Creating Single Restaurant...');
    const existingRestaurant = await Restaurant.findOne({ slug: 'burger-heaven' });
    let restaurant;
    
    if (!existingRestaurant) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      restaurant = await Restaurant.create({
        name: 'Burger Heaven',
        slug: 'burger-heaven',
        type: 'single',
        owner: {
          name: 'John Doe',
          email: 'owner@burgerheaven.com',
          phone: '+1234567890',
          password: hashedPassword,
        },
        subscription: {
          plan: 'trial',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
          maxBranches: 1,
          currentBranches: 0,
        },
        theme: {
          primaryColor: '#3498db',
          secondaryColor: '#95a5a6',
          accentColor: '#e74c3c',
          font: 'Roboto',
        },
        defaultSettings: {
          currency: 'USD',
          defaultTaxIds: [],
          serviceChargePercentage: 0,
          allowBranchOverride: false,
        },
        menuSettings: {
          centralizedMenu: true,
          allowBranchSpecificItems: false,
        },
        isActive: true,
      });
      console.log(`   ✅ Restaurant created: ${restaurant.name} (ID: ${restaurant._id})
`);
    } else {
      restaurant = existingRestaurant;
      console.log(`   ⏭️  Restaurant already exists: ${restaurant.name}
`);
    }

    // 3. Create Owner Staff
    console.log('👔 Creating Owner Staff...');
    const existingStaff = await Staff.findOne({ email: 'owner@burgerheaven.com' });
    let ownerStaff;
    
    if (!existingStaff) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      ownerStaff = await Staff.create({
        restaurantId: restaurant._id,
        staffType: StaffType.OWNER,
        name: 'John Doe',
        email: 'owner@burgerheaven.com',
        phone: '+1234567890',
        password: hashedPassword,
        allowedBranchIds: [],
        isActive: true,
      });
      
      // Update restaurant with ownerId
      await Restaurant.findByIdAndUpdate(restaurant._id, {
        ownerId: ownerStaff._id,
      });
      
      console.log(`   ✅ Owner Staff created: owner@burgerheaven.com / password123 (ID: ${ownerStaff._id})`);
    } else {
      ownerStaff = existingStaff;
      console.log(`   ⏭️  Owner Staff already exists`);
    }

    // 4. Create Owner Permissions
    console.log('🔐 Creating Owner Permissions...');
    const existingPermissions = await StaffTypePermissions.findOne({
      restaurantId: restaurant._id,
      staffType: StaffType.OWNER,
    });
    
    if (!existingPermissions) {
      await StaffTypePermissions.create({
        restaurantId: restaurant._id,
        staffType: StaffType.OWNER,
        permissions: {
          orders: {
            view: true,
            create: true,
            update: true,
            delete: true,
            managePayment: true,
            viewAllBranches: true,
          },
          menu: {
            view: true,
            create: true,
            update: true,
            delete: true,
            manageCategories: true,
            managePricing: true,
          },
          staff: {
            view: true,
            create: true,
            update: true,
            delete: true,
            manageRoles: true,
          },
          reports: {
            view: true,
            export: true,
            viewFinancials: true,
          },
          settings: {
            view: true,
            updateRestaurant: true,
            updateBranch: true,
            manageTaxes: true,
          },
          tables: {
            view: true,
            create: true,
            update: true,
            delete: true,
            manageQR: true,
          },
          customers: {
            view: true,
            manage: true,
          },
        },
      });
      console.log('   ✅ Owner Permissions created');
    } else {
      console.log('   ⏭️  Owner Permissions already exist');
    }

    // 5. Create Default Branch
    console.log('🏢 Creating Default Branch...');
    const existingBranch = await Branch.findOne({ restaurantId: restaurant._id });
    
    if (!existingBranch) {
      const defaultBranch = await Branch.create({
        restaurantId: restaurant._id,
        name: 'Burger Heaven - Main Location',
        code: 'MAIN',
        email: 'owner@burgerheaven.com',
        phone: '+1234567890',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        },
        settings: {
          currency: 'USD',
          taxIds: [],
          serviceChargePercentage: 0,
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
        'subscription.currentBranches': 1,
      });

      console.log(`   ✅ Default Branch created: ${defaultBranch.name} (ID: ${defaultBranch._id})`);
    } else {
      console.log(`   ⏭️  Branch already exists: ${existingBranch.name}`);
    }

    console.log('✨ Test data seeded successfully!');
    console.log('📝 Login Credentials:');
    console.log('   SuperAdmin: admin@test.com / password123');
    console.log('   Owner (Staff): owner@burgerheaven.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedTestData();
