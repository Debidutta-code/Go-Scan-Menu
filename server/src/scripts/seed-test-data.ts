// scripts/seed-test-data.ts
// Seed script to create test superadmin and a single restaurant with default branch

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { SuperAdmin } from '../modules/auth/auth.model';
import { Restaurant } from '../modules/restaurant/models/restaurant.model';
import { Branch } from '../modules/restaurant/models/branch.model';
import { Staff } from '../modules/staff/models/staff.model';
import { Role } from '../modules/rbac/models/role.model';
import { StaffRole, RoleLevel, AccessScope } from '../modules/rbac/role.types';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-extranet';

async function seedTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Seed Roles
    console.log('🔑 Seeding System Roles...');
    const systemRoles = [
      {
        name: StaffRole.SUPER_ADMIN,
        displayName: 'Super Admin',
        description: 'Platform administrator',
        level: RoleLevel.PLATFORM,
        accessScope: AccessScope.PLATFORM,
        isSystemRole: true,
        permissions: {
          orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: true },
          menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
          staff: { view: true, create: true, update: true, delete: true, manageRoles: true },
          reports: { view: true, export: true, viewFinancials: true },
          settings: { view: true, updateRestaurant: true, updateBranch: true, manageTaxes: true },
          tables: { view: true, create: true, update: true, delete: true, manageQR: true },
          customers: { view: true, manage: true }
        }
      },
      {
        name: StaffRole.OWNER,
        displayName: 'Restaurant Owner',
        description: 'Full restaurant access',
        level: RoleLevel.RESTAURANT,
        accessScope: AccessScope.RESTAURANT,
        isSystemRole: true,
        permissions: {
          orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: true },
          menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
          staff: { view: true, create: true, update: true, delete: true, manageRoles: true },
          reports: { view: true, export: true, viewFinancials: true },
          settings: { view: true, updateRestaurant: true, updateBranch: true, manageTaxes: true },
          tables: { view: true, create: true, update: true, delete: true, manageQR: true },
          customers: { view: true, manage: true }
        }
      }
    ];

    for (const roleData of systemRoles) {
      await Role.findOneAndUpdate(
        { name: roleData.name, isSystemRole: true },
        roleData,
        { upsert: true }
      );
    }
    const ownerRole = await Role.findOne({ name: StaffRole.OWNER });

    // 2. Create SuperAdmin
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

    // 3. Create Single Restaurant
    console.log('🏪 Creating Single Restaurant...');
    const existingRestaurant = await Restaurant.findOne({ slug: 'burger-heaven' });
    let restaurant: any;

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
      console.log(`   ✅ Restaurant created: ${restaurant.name}`);
    } else {
      restaurant = existingRestaurant;
      console.log(`   ⏭️  Restaurant already exists: ${restaurant.name}`);
    }

    // 4. Create Owner Staff
    console.log('👔 Creating Owner Staff...');
    const existingStaff = await Staff.findOne({ email: 'owner@burgerheaven.com' });
    let ownerStaff: any;

    if (!existingStaff) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      ownerStaff = await Staff.create({
        restaurantId: restaurant._id,
        roleId: ownerRole?._id,
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

      console.log(`   ✅ Owner Staff created: owner@burgerheaven.com`);
    } else {
      ownerStaff = existingStaff;
      console.log(`   ⏭️  Owner Staff already exists`);
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
            longitude: -74.006,
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

      console.log(`   ✅ Default Branch created: ${defaultBranch.name}`);
    } else {
      console.log(`   ⏭️  Branch already exists: ${existingBranch.name}`);
    }

    console.log('✨ Test data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedTestData();
