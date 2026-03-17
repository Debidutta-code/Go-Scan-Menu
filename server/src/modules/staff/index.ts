// server/src/modules/staff/index.ts
export * from './controllers/staff.controller';
export * from './controllers/role.controller';
export * from './controllers/staff-type-permissions.controller';

export * from './services/staff.service';
export * from './services/role.service';
export * from './services/staff-type-permissions.service';

export * from './repositories/staff.repository';
export * from './repositories/role.repository';
export * from './repositories/staff-type-permissions.repository';

export * from './models/staff.model';
export * from './models/role.model';
export * from './models/staff-type-permissions.model';
export * from './staff.middleware';

export { default as staffRoutes } from './staff.routes';
export { default as roleRoutes } from './role.routes';
export { default as staffTypePermissionsRoutes } from './staff-type-permissions.routes';
