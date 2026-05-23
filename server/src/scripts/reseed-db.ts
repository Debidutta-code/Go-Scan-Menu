import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use relative imports or setup ts-node correctly.
import { SuperAdmin } from '../modules/auth/auth.model';
import { Role } from '../modules/staff/models/role.model';
import { Staff } from '../modules/staff/models/staff.model';
import { Restaurant } from '../modules/restaurant/models/restaurant.model';
import { Category } from '../modules/menu/models/category.model';
import { MenuItem, DietaryType } from '../modules/menu/models/menu-item.model';
import { StaffRole, RoleLevel, AccessScope } from '../types/role.types';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-extranet';

async function reseed() {
  try {
    console.log('🌱 Starting Data Seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clean DB
    console.log('🧹 Cleaning Database...');
    await Promise.all([
      SuperAdmin.deleteMany({}),
      Role.deleteMany({}),
      Staff.deleteMany({}),
      Restaurant.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
    ]);
    console.log('✅ Database cleaned');

    const password = await bcrypt.hash('Test@1234', 10);

    const fullPerms = {
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
      staff: { view: true, create: true, update: true, delete: true, manageRoles: true },
      reports: { view: true, export: true, viewFinancials: true },
      settings: { view: true, updateRestaurant: true, updateBranch: true, manageTaxes: true },
      tables: { view: true, create: true, update: true, delete: true, manageQR: true },
      customers: { view: true, manage: true },
    };

    // 1. Seed System Roles
    console.log('🔑 Seeding System Roles...');
    const rolesToSeed = [
      {
        name: StaffRole.SUPER_ADMIN,
        displayName: 'Super Admin',
        description: 'Platform administrator with full access',
        level: RoleLevel.PLATFORM,
        accessScope: AccessScope.PLATFORM,
        isSystemRole: true,
        permissions: fullPerms,
      },
      {
        name: StaffRole.OWNER,
        displayName: 'Restaurant Owner',
        description: 'Restaurant owner with full access to their restaurant',
        level: RoleLevel.RESTAURANT,
        accessScope: AccessScope.RESTAURANT,
        isSystemRole: true,
        permissions: fullPerms,
      },
    ];

    for (const roleData of rolesToSeed) {
      await Role.findOneAndUpdate({ name: roleData.name, isSystemRole: true }, roleData, {
        upsert: true,
        new: true,
      });
    }
    console.log('✅ Roles seeded');

    // 2. Create SuperAdmin
    console.log('👤 Creating SuperAdmin: superadmin@gmail.com');
    await SuperAdmin.findOneAndUpdate(
      { email: 'superadmin@gmail.com' },
      {
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        password,
        isActive: true,
        permissions: fullPerms,
      },
      { upsert: true }
    );

    const ownerRole = await Role.findOne({ name: StaffRole.OWNER });

    async function createRestaurantData(
      name: string,
      slug: string,
      ownerEmail: string,
    ) {
      console.log(`🏪 Creating Restaurant: ${name}`);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const restaurant = await Restaurant.create({
        name,
        slug,
        type: 'single',
        owner: { name: `${name} Owner`, email: ownerEmail, phone: '1234567890', password },
        isActive: true,
        subscription: {
          plan: 'trial',
          startDate,
          endDate,
          isActive: true,
          maxBranches: 1,
          currentBranches: 1,
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
      });

      console.log(`👔 Creating Owner Staff for ${name}`);
      const ownerStaff = await Staff.create({
        restaurantId: restaurant._id,
        roleId: ownerRole?._id,
        name: `${name} Owner`,
        email: ownerEmail,
        phone: '1234567890',
        password,
        isActive: true,
      });

      await Restaurant.findByIdAndUpdate(restaurant._id, { ownerId: ownerStaff._id });

      // Add a category and menu item
      const category = await Category.create({
        restaurantId: restaurant._id,
        name: 'General',
        displayOrder: 1,
        isActive: true,
      });

      await MenuItem.create({
        restaurantId: restaurant._id,
        categoryId: category._id,
        name: `${name} Special`,
        price: 15.0,
        itemType: 'food',
        dietaryType: DietaryType.VEG,
        isActive: true,
        isAvailable: true,
      });

      return { restaurant };
    }

    // Create one
    await createRestaurantData('Single Cafe', 'single-cafe', 'single@gmail.com');

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

reseed();
