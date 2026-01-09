// src/types/table.types.ts

export interface Table {
  _id: string;
  restaurantId: string;
  branchId: string;
  tableNumber: string;
  qrCode: string;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  _id: string;
  restaurantId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTablePayload {
  tableNumber: string;
  capacity: number;
  location?: Table['location'];
}

export interface BulkCreateTablePayload {
  prefix: string;
  startNumber: number;
  endNumber: number;
  capacity: number;
  location?: Table['location'];
}

export interface UpdateTablePayload {
  tableNumber?: string;
  capacity?: number;
  location?: Table['location'];
  status?: Table['status'];
}

export interface TableListResponse {
  tables: Table[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BranchListResponse {
  branches: Branch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}