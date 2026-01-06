"# Role System Testing Guide

## System Overview

The role system has been completely restructured following industry standards (similar to Petpooja and DotPe). The new system features:

### ✅ Key Improvements

1. **Separated SuperAdmin from Restaurant Roles**
   - SuperAdmin is now platform-level, completely separate from restaurant staff
   - No role confusion during authentication

2. **Industry-Standard Role Hierarchy**
   ```
   PLATFORM LEVEL
   └── Super Admin (Platform administrator)
   
   RESTAURANT LEVEL
   └── Owner (Full restaurant access)
       ├── Branch Manager (Multi-branch management)
       │   └── Manager (Single branch management)
       │       ├── Waiter (Order & table management)
       │       ├── Kitchen Staff (Kitchen operations)
       │       └── Cashier (Payment processing)
   ```

3. **Granular Permissions System**
   - 7 permission modules: Orders, Menu, Staff, Reports, Settings, Tables, Customers
   - Each module has specific actions (view, create, update, delete, etc.)
   - 29+ individual permission controls

4. **Role Templates**
   - System-seeded default roles
   - Pre-configured permissions for each role type
   - Consistent across all restaurants

5. **Access Scopes**
   - PLATFORM: Full platform access (SuperAdmin)
   - RESTAURANT: All branches in restaurant (Owner)
   - BRANCH_MULTI: Multiple assigned branches (Branch Manager)
   - BRANCH_SINGLE: Single branch only (Manager, Waiter, etc.)

---

## Testing the System

### 1. SuperAdmin Authentication

**Register SuperAdmin** (First Time Only)
```bash
curl -X POST http://localhost:8001/api/v1/superadmin/auth/register \
  -H \"Content-Type: application/json\" \
  -d '{
    \"name\": \"Super Admin\",
    \"email\": \"admin@test.com\",
    \"password\": \"password123\"
  }'
```

**Login SuperAdmin**
```bash
curl -X POST http://localhost:8001/api/v1/superadmin/auth/login \
  -H \"Content-Type: application/json\" \
  -d '{
    \"email\": \"admin@test.com\",
    \"password\": \"password123\"
  }'
```

Expected Response:
```json
{
  \"success\": true,
  \"message\": \"Login successful\",
  \"data\": {
    \"superAdmin\": {
      \"id\": \"...\",
      \"name\": \"Super Admin\",
      \"email\": \"admin@test.com\",
      \"role\": \"super_admin\",
      \"permissions\": {
        \"orders\": { \"view\": true, \"create\": true, ... },
        \"menu\": { \"view\": true, \"create\": true, ... },
        ...
      }
    },
    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"
  }
}
```

---

### 2. Create Restaurant (As SuperAdmin)

```bash
# Get SuperAdmin token first
TOKEN=$(curl -s -X POST http://localhost:8001/api/v1/superadmin/auth/login \
  -H \"Content-Type: application/json\" \
  -d '{\"email\":\"admin@test.com\",\"password\":\"password123\"}' \
  | grep -o '\"token\":\"[^\"]*' | cut -d'\"' -f4)

# Create restaurant
curl -X POST http://localhost:8001/api/v1/restaurants \
  -H \"Content-Type: application/json\" \
  -H \"Authorization: Bearer $TOKEN\" \
  -d '{
    \"name\": \"My Restaurant\",
    \"slug\": \"my-restaurant\",
    \"type\": \"single\",
    \"owner\": {
      \"name\": \"Restaurant Owner\",
      \"email\": \"owner@restaurant.com\",
      \"phone\": \"+1234567890\",
      \"password\": \"password123\"
    }
  }'
```

This automatically:
- Creates the restaurant
- Creates an owner staff record with OWNER role
- Assigns full restaurant permissions

---

### 3. Staff Authentication

**Login as Owner**
```bash
curl -X POST http://localhost:8001/api/v1/staff/login \
  -H \"Content-Type: application/json\" \
  -d '{
    \"email\": \"owner@restaurant.com\",
    \"password\": \"password123\"
  }'
```

Expected Response:
```json
{
  \"success\": true,
  \"message\": \"Login successful\",
  \"data\": {
    \"staff\": {
      \"_id\": \"...\",
      \"name\": \"Restaurant Owner\",
      \"email\": \"owner@restaurant.com\",
      \"role\": \"owner\",
      \"accessScope\": \"restaurant\",
      \"permissions\": {
        \"orders\": { \"view\": true, \"create\": true, \"update\": true, \"delete\": true, ... },
        \"menu\": { \"view\": true, \"create\": true, \"update\": true, \"delete\": true, ... },
        \"staff\": { \"view\": true, \"create\": true, \"update\": true, \"delete\": true, \"manageRoles\": true },
        ...
      }
    },
    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"
  }
}
```

---

## Role Permission Matrix

| Role | Level | Orders | Menu | Staff | Reports | Settings | Tables |
|------|-------|---------|------|-------|---------|----------|--------|
| **Super Admin** | Platform | Full | Full | Full | Full | Full | Full |
| **Owner** | Restaurant | Full | Full | Full | Full | Full | Full |
| **Branch Manager** | Multi-Branch | Create, Update, Payment | Full | View, Create, Update | Full | View, Branch Edit | Full |
| **Manager** | Single Branch | Create, Update, Payment | Create, Update, Pricing | View Only | View Only | View, Branch Edit | Manage |
| **Waiter** | Operational | Create, Update | View Only | None | None | None | View, Update |
| **Kitchen Staff** | Operational | View, Update Status | View Only | None | None | None | View |
| **Cashier** | Operational | View, Payment | View Only | None | None | None | View |

---

## System Roles (Pre-seeded)

All these roles are automatically created on server startup:

1. **super_admin** - Platform administrator
2. **owner** - Restaurant owner (auto-assigned during restaurant creation)
3. **branch_manager** - Branch manager
4. **manager** - Single branch manager
5. **waiter** - Wait staff
6. **kitchen_staff** - Kitchen personnel
7. **cashier** - Cashier/billing staff

---

## Authorization Middleware

The system provides flexible authorization checks:

### 1. Role-Based Authorization
```typescript
router.get('/admin-only', 
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeRoles(StaffRole.SUPER_ADMIN, StaffRole.OWNER),
  controller.method
);
```

### 2. Permission-Based Authorization
```typescript
// Single permission
router.post('/menu-items',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizePermission('menu', 'create'),
  controller.createItem
);

// Multiple permissions (ALL required)
router.delete('/staff/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeAllPermissions('staff.delete', 'staff.manageRoles'),
  controller.deleteStaff
);

// Any permission (AT LEAST ONE required)
router.get('/reports',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorizeAnyPermission('reports.view', 'reports.export'),
  controller.getReports
);
```

### 3. SuperAdmin Bypass
SuperAdmin automatically bypasses all permission checks while still going through role checks.

---

## Database Schema

### Role Model
```typescript
{
  name: StaffRole (enum),
  displayName: string,
  description: string,
  level: RoleLevel (1-5),
  accessScope: AccessScope,
  restaurantId: ObjectId | null,  // null = system role
  permissions: RolePermissions,
  isSystemRole: boolean,
  isActive: boolean
}
```

### Staff Model
```typescript
{
  restaurantId: ObjectId,
  branchId: ObjectId,           // Primary branch
  roleId: ObjectId,              // Reference to Role
  name: string,
  email: string,
  phone: string,
  password: string,
  allowedBranchIds: ObjectId[],  // For multi-branch access
  isActive: boolean
}
```

### SuperAdmin Model
```typescript
{
  name: string,
  email: string,
  password: string,
  permissions: RolePermissions,  // Direct permissions, no roleId
  isActive: boolean
}
```

---

## JWT Token Payload

### SuperAdmin Token
```typescript
{
  id: string,
  email: string,
  role: \"super_admin\",
  permissions: RolePermissions
}
```

### Staff Token
```typescript
{
  id: string,
  email: string,
  role: StaffRole,
  roleId: string,
  restaurantId: string,
  branchId: string,
  accessScope: AccessScope,
  allowedBranchIds: string[],
  permissions: RolePermissions
}
```

---

## Migration from Old System

### Changes Made:
1. ✅ Removed hardcoded role checks
2. ✅ Separated SuperAdmin authentication flow
3. ✅ Added RoleRepository for dynamic role management
4. ✅ Staff model no longer has `accessLevel` - now uses `role.accessScope`
5. ✅ All permissions now granular (29+ controls vs 6 basic)
6. ✅ Added role hierarchy and levels
7. ✅ System roles auto-seed on startup

### Compatibility:
- Old SuperAdmin accounts need re-creation
- Old Staff accounts need role assignment
- All routes updated to use new permission system

---

## Troubleshooting

### Issue: \"Role not found or inactive\"
**Solution:** Restart the server to trigger role seeding:
```bash
sudo supervisorctl restart backend
```

### Issue: \"MONGO_URI is not defined\"
**Solution:** Create/check `/app/server/.env`:
```
MONGO_URI=mongodb://localhost:27017/restaurant-management
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=8001
```

### Issue: Staff login returns \"Invalid credentials\"
**Solution:** Ensure staff was created with a roleId:
```javascript
// Staff must have a valid roleId assigned during creation
const ownerRole = await roleRepo.findByName(StaffRole.OWNER);
staff.roleId = ownerRole._id;
```

---

## API Endpoints

### SuperAdmin Routes
- POST `/api/v1/superadmin/auth/register` - Register super admin
- POST `/api/v1/superadmin/auth/login` - Super admin login
- GET `/api/v1/superadmin/auth/profile` - Get profile (auth required)

### Staff Routes
- POST `/api/v1/staff/login` - Staff login
- GET `/api/v1/staff/me` - Get current staff profile (auth required)
- POST `/api/v1/staff` - Create staff (requires staff.create permission)
- GET `/api/v1/staff/:id` - Get staff details
- PUT `/api/v1/staff/:id` - Update staff
- PUT `/api/v1/staff/:id/role` - Update staff role

### Role Routes
- GET `/api/v1/roles` - Get all roles
- GET `/api/v1/roles/system` - Get system roles
- GET `/api/v1/roles/:id` - Get role details
- PUT `/api/v1/roles/:id` - Update role (owner/super admin only)
- PUT `/api/v1/roles/:id/permissions` - Update role permissions

---

## Success Metrics

✅ SuperAdmin login working  
✅ Staff login working  
✅ Role-based access control implemented  
✅ Permission-based authorization working  
✅ Restaurant creation auto-assigns owner role  
✅ System roles auto-seeded on startup  
✅ JWT tokens include role and permissions  
✅ Middleware validates permissions in real-time  
✅ SuperAdmin bypass working  
✅ No role confusion between platform and restaurant staff  

---

**System Status:** ✅ PRODUCTION READY  
**Last Updated:** January 6, 2025  
**Version:** 2.0.0 (Complete Restructure)
"