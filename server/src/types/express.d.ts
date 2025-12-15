declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'super_admin' | 'owner' | 'branch_manager' | 'manager' | 'waiter' | 'kitchen_staff' | 'cashier';
        restaurantId?: string;
        branchId?: string;
        accessLevel?: 'single_branch' | 'all_branches';
        allowedBranchIds?: string[];
      };
    }
  }
}

export {};