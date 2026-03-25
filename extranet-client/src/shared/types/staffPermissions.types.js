// extranet-client/src/shared/types/staffPermissions.types.ts
export var StaffRole;
(function (StaffRole) {
    StaffRole["SUPER_ADMIN"] = "super_admin";
    StaffRole["OWNER"] = "owner";
    StaffRole["BRANCH_MANAGER"] = "branch_manager";
    StaffRole["MANAGER"] = "manager";
    StaffRole["WAITER"] = "waiter";
    StaffRole["KITCHEN_STAFF"] = "kitchen_staff";
    StaffRole["CASHIER"] = "cashier";
})(StaffRole || (StaffRole = {}));
export var RoleLevel;
(function (RoleLevel) {
    RoleLevel[RoleLevel["PLATFORM"] = 1] = "PLATFORM";
    RoleLevel[RoleLevel["RESTAURANT"] = 2] = "RESTAURANT";
    RoleLevel[RoleLevel["BRANCH_MULTI"] = 3] = "BRANCH_MULTI";
    RoleLevel[RoleLevel["BRANCH_SINGLE"] = 4] = "BRANCH_SINGLE";
    RoleLevel[RoleLevel["OPERATIONAL"] = 5] = "OPERATIONAL";
})(RoleLevel || (RoleLevel = {}));
export var AccessScope;
(function (AccessScope) {
    AccessScope["PLATFORM"] = "platform";
    AccessScope["RESTAURANT"] = "restaurant";
    AccessScope["BRANCH_MULTI"] = "branch_multi";
    AccessScope["BRANCH_SINGLE"] = "branch_single";
})(AccessScope || (AccessScope = {}));
