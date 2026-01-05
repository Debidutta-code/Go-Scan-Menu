export const createSuperAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  roleId: any;
}): Promise<ISuperAdmin> => {
  return SuperAdmin.create(data);
};
