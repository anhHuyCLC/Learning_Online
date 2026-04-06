import apiClient from './apiClient';

const adminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get(`/admin/dashboard`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get(`/admin/users`);
    return response.data;
  },

  updateUserRole: async (userId: number, role: string) => {
    const response = await apiClient.put(`/admin/users/role`, { userId, role });
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default adminService;