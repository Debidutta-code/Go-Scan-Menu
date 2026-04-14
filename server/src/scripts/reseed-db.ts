import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use relative imports or setup ts-node correctly.
// Since I'm creating this in server/src/scripts/reseed-db.ts, I'll use relative imports to the models.
import { SuperAdmin } from '../modules/auth/auth.model';
import { Role } from '../modules/staff/models/role.model';
import { Staff } from '../modules/staff/models/staff.model';
import { Restaurant } from '../modules/restaurant/models/restaurant.model';
import { Branch } from '../modules/restaurant/models/branch.model';
import { Category } from '../modules/menu/models/category.model';
import { MenuItem } from '../modules/menu/models/menu-item.model';
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

    // 3. Create Restaurant
    console.log('🏪 Creating Restaurant: Burger Heaven');
    const restaurant = await Restaurant.findOneAndUpdate(
      { slug: 'burger-heaven' },
      {
        name: 'Burger Heaven',
        slug: 'burger-heaven',
        type: 'single',
        owner: { name: 'Owner User', email: 'owner@gmail.com', phone: '1234567890', password },
        isActive: true,
        subscription: { plan: 'pro', isActive: true, maxBranches: 10, currentBranches: 1 },
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
        menuSettings: { centralizedMenu: true, allowBranchSpecificItems: false },
      },
      { upsert: true, new: true }
    );

    // 4. Create Branch
    console.log('🏢 Creating Branch: Main Branch');
    const branch = await Branch.findOneAndUpdate(
      { restaurantId: restaurant._id, code: 'BH01' },
      {
        restaurantId: restaurant._id,
        name: 'Main Branch',
        code: 'BH01',
        email: 'branch@gmail.com',
        phone: '0987654321',
        address: {
          street: '123 Burger St',
          city: 'NY',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: { latitude: 40.7128, longitude: -74.006 },
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
      },
      { upsert: true, new: true }
    );

    // 5. Create Staff for each role
    console.log('👔 Creating Staff members...');
    const roles = await Role.find({ isSystemRole: true });
    for (const role of roles) {
      if (role.name === StaffRole.SUPER_ADMIN) continue; // SuperAdmin is in separate collection

      const email = `${role.name}@gmail.com`;
      console.log(`   - Creating ${role.name}: ${email}`);
      const staffData = {
        restaurantId: restaurant._id,
        branchId: branch._id,
        roleId: role._id,
        name: `${role.displayName} User`,
        email: email,
        phone: '1234567890',
        password,
        isActive: true,
        allowedBranchIds: [branch._id],
      };

      const staff = await Staff.findOneAndUpdate({ email }, staffData, { upsert: true, new: true });

      if (role.name === StaffRole.OWNER) {
        await Restaurant.findByIdAndUpdate(restaurant._id, { ownerId: staff._id });
      }
    }

    // 6. Create Category
    console.log('📂 Creating Category: Burgers');
    const category = await Category.findOneAndUpdate(
      { restaurantId: restaurant._id, name: 'Burgers' },
      {
        restaurantId: restaurant._id,
        name: 'Burgers',
        description: 'Delicious burgers',
        displayOrder: 1,
        isActive: true,
        scope: 'restaurant',
      },
      { upsert: true, new: true }
    );

    // 7. Create Menu Item
    console.log('🍔 Creating Menu Item: Classic Burger');
    await MenuItem.findOneAndUpdate(
      { restaurantId: restaurant._id, name: 'Classic Burger' },
      {
        restaurantId: restaurant._id,
        categoryId: category._id,
        name: 'Classic Burger',
        description: 'Our signature burger',
        price: 10.99,
        itemType: 'food',
        dietaryType: 'NON_VEG',
        isActive: true,
        isAvailable: true,
        scope: 'restaurant',
      },
      { upsert: true }
    );

    // 8. Create Table
    console.log('🪑 Creating Table: A1');
    await Table.findOneAndUpdate(
      { branchId: branch._id, tableNumber: 'A1' },
      {
        restaurantId: restaurant._id,
        branchId: branch._id,
        tableNumber: 'A1',
        qrCode: `QR-${restaurant.slug}-${branch.code}-A1`,
        capacity: 4,
        location: 'indoor',
        status: 'available',
        isActive: true,
      },
      { upsert: true }
    );

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

reseed();
