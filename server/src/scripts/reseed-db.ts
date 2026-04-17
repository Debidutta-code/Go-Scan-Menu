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
import { Branch } from '../modules/restaurant/models/branch.model';
import { Category } from '../modules/menu/models/category.model';
import { MenuItem, DietaryType } from '../modules/menu/models/menu-item.model';
import { Table } from '../modules/table/models/table.model';
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
      Branch.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
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
      {
        name: StaffRole.BRANCH_MANAGER,
        displayName: 'Branch Manager',
        description: 'Manages multiple branches',
        level: RoleLevel.BRANCH_MULTI,
        accessScope: AccessScope.BRANCH_MULTI,
        isSystemRole: true,
        permissions: fullPerms,
      },
      {
        name: StaffRole.MANAGER,
        displayName: 'Store Manager',
        description: 'Manages a single branch',
        level: RoleLevel.BRANCH_SINGLE,
        accessScope: AccessScope.BRANCH_SINGLE,
        isSystemRole: true,
        permissions: fullPerms,
      },
      {
        name: StaffRole.WAITER,
        displayName: 'Waiter',
        description: 'Operational staff for orders',
        level: RoleLevel.OPERATIONAL,
        accessScope: AccessScope.BRANCH_SINGLE,
        isSystemRole: true,
        permissions: {
          ...fullPerms,
          staff: { ...fullPerms.staff, manageRoles: false, delete: false },
        },
      },
    ];

    for (const roleData of rolesToSeed) {
      await Role.findOneAndUpdate({ name: roleData.name, isSystemRole: true }, roleData, {
        upsert: true,
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
      type: 'single' | 'branch-wise' | 'chain',
      ownerEmail: string,
      maxBranches: number
    ) {
      console.log(`🏪 Creating Restaurant: ${name} (${type})`);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const restaurant = await Restaurant.create({
        name,
        slug,
        type,
        owner: { name: `${name} Owner`, email: ownerEmail, phone: '1234567890', password },
        isActive: true,
        subscription: {
          plan: 'trial',
          startDate,
          endDate,
          isActive: true,
          maxBranches,
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

      console.log(`🏢 Creating Main Branch for ${name}`);
      const branch = await Branch.create({
        restaurantId: restaurant._id,
        name: `${name} - Main`,
        code: `${slug.substring(0, 2).toUpperCase()}01`,
        isMain: true,
        email: `branch@${slug}.com`,
        phone: '0987654321',
        address: {
          street: 'Main Street',
          city: 'City',
          state: 'State',
          zipCode: '00000',
          country: 'Country',
          coordinates: { latitude: 0, longitude: 0 },
        },
        isActive: true,
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
      });

      console.log(`👔 Creating Owner Staff for ${name}`);
      const ownerStaff = await Staff.create({
        restaurantId: restaurant._id,
        branchId: branch._id,
        roleId: ownerRole?._id,
        name: `${name} Owner`,
        email: ownerEmail,
        phone: '1234567890',
        password,
        isActive: true,
        allowedBranchIds: [branch._id],
      });

      await Restaurant.findByIdAndUpdate(restaurant._id, { ownerId: ownerStaff._id });

      // Add a category and menu item
      const category = await Category.create({
        restaurantId: restaurant._id,
        name: 'General',
        displayOrder: 1,
        isActive: true,
        scope: 'restaurant',
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
        scope: 'restaurant',
      });

      // Add a table
      await Table.create({
        restaurantId: restaurant._id,
        branchId: branch._id,
        tableNumber: 'T1',
        qrCode: `QR-${slug}-T1`,
        capacity: 4,
        status: 'available',
        isActive: true,
      });

      return { restaurant, branch };
    }

    // Create one of each type
    await createRestaurantData('Single Cafe', 'single-cafe', 'single', 'single@gmail.com', 1);
    await createRestaurantData('Pizza Local', 'pizza-local', 'branch-wise', 'branch@gmail.com', 5);
    await createRestaurantData('Burger Heaven', 'burger-heaven', 'chain', 'owner@gmail.com', 10);

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

reseed();
