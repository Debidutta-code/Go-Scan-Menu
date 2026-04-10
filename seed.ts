import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-extranet';

// Simple Schemas to avoid import issues
const RoleSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  description: String,
  level: Number,
  accessScope: String,
  permissions: Object,
  isSystemRole: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, default: null }
});

const SuperAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: { type: Object },
  isActive: { type: Boolean, default: true }
});

const RestaurantSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  type: String,
  owner: { name: String, email: String, phone: String, password: { type: String, select: false } },
  ownerId: mongoose.Schema.Types.ObjectId,
  subscription: Object,
  isActive: { type: Boolean, default: true }
});

const StaffSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  branchId: mongoose.Schema.Types.ObjectId,
  roleId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: { type: String, required: true },
  allowedBranchIds: [mongoose.Schema.Types.ObjectId],
  isActive: { type: Boolean, default: true },
  staffType: String
});

const BranchSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  name: String,
  code: String,
  email: String,
  phone: String,
  address: { street: String, city: String, state: String, zipCode: String, country: String, coordinates: { latitude: Number, longitude: Number } },
  isActive: { type: Boolean, default: true }
});

const CategorySchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  displayOrder: Number,
  scope: String,
  isActive: { type: Boolean, default: true }
});

const MenuItemSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  categoryId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number,
  itemType: String,
  dietaryType: String,
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  scope: String
});

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
const Branch = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

async function seed() {
  try {
    console.log('🌱 Starting Industry Standard Seeding...');
    // Connect with a longer timeout and handle errors
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const fullPerms = {
      orders: { view: true, create: true, update: true, delete: true, managePayment: true, viewAllBranches: true },
      menu: { view: true, create: true, update: true, delete: true, manageCategories: true, managePricing: true },
      staff: { view: true, create: true, update: true, delete: true, manageRoles: true },
      reports: { view: true, export: true, viewFinancials: true },
      settings: { view: true, updateRestaurant: true, updateBranch: true, manageTaxes: true },
      tables: { view: true, create: true, update: true, delete: true, manageQR: true },
      customers: { view: true, manage: true },
    };

    // 1. Seed System Roles
    console.log('🔑 Seeding System Roles...');
    const systemRoles = [
      { name: 'super_admin', displayName: 'Super Admin', level: 1, accessScope: 'platform', isSystemRole: true, permissions: fullPerms },
      { name: 'owner', displayName: 'Restaurant Owner', level: 2, accessScope: 'restaurant', isSystemRole: true, permissions: fullPerms },
      { name: 'branch_manager', displayName: 'Branch Manager', level: 3, accessScope: 'branch_multi', isSystemRole: true, permissions: fullPerms },
    ];

    for (const r of systemRoles) {
      await Role.findOneAndUpdate({ name: r.name, isSystemRole: true }, r, { upsert: true });
    }
    const ownerRole = await Role.findOne({ name: 'owner' });
    const bmRole = await Role.findOne({ name: 'branch_manager' });

    // 2. Create SuperAdmin
    console.log('👤 Creating SuperAdmin: supearadmin@gmail.com');
    const saPass = await bcrypt.hash('Test@1234', 10);
    await SuperAdmin.findOneAndUpdate(
      { email: 'supearadmin@gmail.com' },
      { name: 'Super Admin', email: 'supearadmin@gmail.com', password: saPass, isActive: true, permissions: fullPerms },
      { upsert: true }
    );

    // 3. Create Restaurant
    console.log('🏪 Creating Restaurant: Burger Heaven');
    const ownerPass = await bcrypt.hash('Test@1234', 10);
    const restaurant = await Restaurant.findOneAndUpdate(
      { slug: 'burger-heaven' },
      {
        name: 'Burger Heaven',
        slug: 'burger-heaven',
        type: 'chain',
        owner: { name: 'Owner User', email: 'test@gmail.com', phone: '1234567890', password: ownerPass },
        isActive: true,
        subscription: { plan: 'pro', isActive: true, maxBranches: 10, currentBranches: 1 }
      },
      { upsert: true, new: true }
    );

    // 4. Create Owner Staff
    console.log('👔 Creating Owner Staff: test@gmail.com');
    const ownerStaff = await Staff.findOneAndUpdate(
      { email: 'test@gmail.com' },
      {
        restaurantId: restaurant._id,
        roleId: ownerRole._id,
        staffType: 'owner',
        name: 'Owner User',
        email: 'test@gmail.com',
        phone: '1234567890',
        password: ownerPass,
        isActive: true
      },
      { upsert: true, new: true }
    );
    await Restaurant.findByIdAndUpdate(restaurant._id, { ownerId: ownerStaff._id });

    // 5. Create Branch
    console.log('🏢 Creating Branch: Main Branch');
    const branch = await Branch.findOneAndUpdate(
      { restaurantId: restaurant._id, code: 'BH01' },
      {
        restaurantId: restaurant._id,
        name: 'Main Branch',
        code: 'BH01',
        email: 'branch@gmail.com',
        phone: '0987654321',
        address: { street: '123 Burger St', city: 'NY', state: 'NY', zipCode: '10001', country: 'USA', coordinates: { latitude: 0, longitude: 0 } },
        isActive: true
      },
      { upsert: true, new: true }
    );

    // 6. Create Branch Manager
    console.log('👨‍💼 Creating Branch Manager: branch@gmail.com');
    const bmPass = await bcrypt.hash('Test@gmail.com', 10);
    await Staff.findOneAndUpdate(
      { email: 'branch@gmail.com' },
      {
        restaurantId: restaurant._id,
        branchId: branch._id,
        roleId: bmRole._id,
        staffType: 'branch_manager',
        name: 'Branch Manager',
        email: 'branch@gmail.com',
        phone: '0987654321',
        password: bmPass,
        isActive: true,
        allowedBranchIds: [branch._id]
      },
      { upsert: true }
    );

    // 7. Create Category
    console.log('📂 Creating Category: Burgers');
    const category = await Category.findOneAndUpdate(
      { restaurantId: restaurant._id, name: 'Burgers' },
      { restaurantId: restaurant._id, name: 'Burgers', displayOrder: 1, isActive: true, scope: 'restaurant' },
      { upsert: true, new: true }
    );

    // 8. Create Menu Item
    console.log('🍔 Creating Menu Item: Classic Burger');
    await MenuItem.findOneAndUpdate(
      { restaurantId: restaurant._id, name: 'Classic Burger' },
      {
        restaurantId: restaurant._id,
        categoryId: category._id,
        name: 'Classic Burger',
        price: 10.99,
        itemType: 'food',
        dietaryType: 'NON_VEG',
        isActive: true,
        isAvailable: true,
        scope: 'restaurant'
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

seed();
