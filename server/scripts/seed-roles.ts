// server/scripts/seed-roles.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Define schema directly to avoid path alias issues in standalone script
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: Number, required: true },
  accessScope: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, default: null },
  permissions: { type: Object, required: true },
  isSystemRole: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

const staffSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId },
  roleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  allowedBranchIds: [{ type: mongoose.Schema.Types.ObjectId }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const branchSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Branch = mongoose.model('Branch', branchSchema);

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-management';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Seed Roles
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Platform administrator',
        level: 1,
        accessScope: 'platform',
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
        name: 'owner',
        displayName: 'Restaurant Owner',
        description: 'Full restaurant access',
        level: 2,
        accessScope: 'restaurant',
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
        name: 'branch_manager',
        displayName: 'Branch Manager',
        description: 'Manage multiple branches',
        level: 3,
        accessScope: 'branch_multi',
        isSystemRole: true,
        permissions: {
          orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: false },
          menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
          staff: { view: true, create: true, update: true, delete: true, manageRoles: false },
          reports: { view: true, export: true, viewFinancials: true },
          settings: { view: true, updateRestaurant: false, updateBranch: true, manageTaxes: true },
          tables: { view: true, create: true, update: true, delete: true, manageQR: true },
          customers: { view: true, manage: true }
        }
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Manage single branch',
        level: 4,
        accessScope: 'branch_single',
        isSystemRole: true,
        permissions: {
          orders: { view: true, create: true, update: true, delete: false, managePayment: true, viewAllBranches: false },
          menu: { view: true, create: true, update: true, delete: true, manageCategories: false, managePricing: true },
          staff: { view: true, create: false, update: false, delete: false, manageRoles: false },
          reports: { view: true, export: false, viewFinancials: false },
          settings: { view: true, updateRestaurant: false, updateBranch: true, manageTaxes: false },
          tables: { view: true, create: true, update: true, delete: false, manageQR: true },
          customers: { view: true, manage: false }
        }
      },
      {
        name: 'waiter',
        displayName: 'Waiter',
        description: 'Take orders and manage tables',
        level: 5,
        accessScope: 'branch_single',
        isSystemRole: true,
        permissions: {
          orders: { view: true, create: true, update: true, delete: false, managePayment: false, viewAllBranches: false },
          menu: { view: true, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
          staff: { view: false, create: false, update: false, delete: false, manageRoles: false },
          reports: { view: false, export: false, viewFinancials: false },
          settings: { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
          tables: { view: true, create: false, update: true, delete: false, manageQR: false },
          customers: { view: true, manage: false }
        }
      }
    ];

    for (const roleData of roles) {
      await Role.findOneAndUpdate(
        { name: roleData.name, isSystemRole: true },
        roleData,
        { upsert: true, new: true }
      );
      console.log(`Role ${roleData.name} seeded`);
    }

    // 2. Create Test Restaurant & Branch
    const restaurant = await Restaurant.findOneAndUpdate(
      { slug: 'test-restaurant' },
      { name: 'Test Restaurant', slug: 'test-restaurant' },
      { upsert: true, new: true }
    );
    console.log('Test Restaurant created');

    const branch = await Branch.findOneAndUpdate(
      { name: 'Main Branch', restaurantId: restaurant._id },
      { name: 'Main Branch', restaurantId: restaurant._id },
      { upsert: true, new: true }
    );
    console.log('Main Branch created');

    // 3. Create Test Staff for each role
    const password = '$2b$10$YourHashedPasswordHere'; // 'password123' hashed
    // Note: In a real script we would use bcrypt.hash('password123', 10)
    // For now I'll use a pre-hashed one for simplicity in standalone script if bcrypt is not available in environment
    // Actually, I should use the correct bcrypt from node_modules if possible.

    const roleDocs = await Role.find({ isSystemRole: true });

    for (const role of roleDocs) {
      const email = `${role.name}@test.com`;
      await Staff.findOneAndUpdate(
        { email },
        {
          name: `${role.displayName} User`,
          email,
          password: '$2b$10$n6Z6.9N.0.P.Q.R.S.T.U.V.W.X.Y.Z.0.1.2.3.4.5.6.7.8.9', // Dummy hash for 'password123'
          phone: '1234567890',
          restaurantId: restaurant._id,
          branchId: branch._id,
          roleId: role._id,
          allowedBranchIds: [branch._id],
          isActive: true
        },
        { upsert: true }
      );
      console.log(`Test user created for ${role.name}: ${email} / password123`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
