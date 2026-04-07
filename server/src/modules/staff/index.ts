// server/src/modules/staff/index.ts
export * from './controllers/staff.controller';

export * from './services/staff.service';

export * from './repositories/staff.repository';

export * from './models/staff.model';
export * from './staff.middleware';

export { default as staffRoutes } from './staff.routes';
