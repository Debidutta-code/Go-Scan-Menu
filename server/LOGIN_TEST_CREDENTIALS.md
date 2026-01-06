"# Login Test Credentials

## Superadmin Login
**Endpoint:** `POST http://localhost:8080/api/v1/superadmin/auth/login`

**Credentials:**
- Email: `admin@test.com`
- Password: `password123`

**Test curl command:**
```bash
curl -X POST http://localhost:8080/api/v1/superadmin/auth/login \
  -H \"Content-Type: application/json\" \
  -d '{\"email\":\"admin@test.com\",\"password\":\"password123\"}'
```

## Staff Login
**Endpoint:** `POST http://localhost:8080/api/v1/staff/login`

**Credentials:**
- Email: `staff@test.com`
- Password: `password123`
- Role: `owner` (Owner role in Test Restaurant)

**Test curl command:**
```bash
curl -X POST http://localhost:8080/api/v1/staff/login \
  -H \"Content-Type: application/json\" \
  -d '{\"email\":\"staff@test.com\",\"password\":\"password123\"}'
```

## Issues Fixed

### 1. Missing super_admin Role
**Problem:** The `super_admin` role was not being seeded in the database, causing superadmin login to fail.

**Solution:** Added super_admin role to the `seedSystemRoles()` function in `/app/server/src/services/role.service.ts`

### 2. ObjectId Casting Error
**Problem:** Both superadmin and staff login services were failing with \"Cast to ObjectId failed\" error. The repositories were populating the `roleId` field with the full role object, but the services were trying to treat it as an ObjectId.

**Solution:** Modified both login services to handle populated fields properly:
- `/app/server/src/services/superadmin.auth.service.ts` - Check if roleId is already populated before fetching
- `/app/server/src/services/staff.service.ts` - Handle populated roleId, restaurantId, branchId, and allowedBranchIds fields

### 3. JWT Token Size Issue
**Problem:** Staff login was generating extremely large JWT tokens because populated objects were being converted to strings and included in the token.

**Solution:** Extract only the ObjectId values from populated fields before generating the JWT token.

## Testing from Frontend

### For Extranet Client (Staff Login)
The extranet-client is configured to connect to `http://localhost:8080/api/v1` and sends staff login requests including a `role` parameter (though the backend doesn't use it currently).

### For Client (Superadmin Login)  
The client application should use the superadmin auth endpoints at `/api/v1/superadmin/auth/login`.

## Database
- **MongoDB URL:** `mongodb://localhost:27017/restaurant-management`
- **Test Restaurant:** Test Restaurant (ID: 695c06f768e320c69af9276e)
- **Test Branch:** Main Branch (ID: 695c06f768e320c69af92771)
"