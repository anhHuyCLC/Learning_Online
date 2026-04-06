import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import adminService from '../services/adminService';
import type { User } from '../type/userType';

interface AdminState {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
  };
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: { totalUsers: 0, totalCourses: 0, totalRevenue: 0 },
  users: [],
  loading: false,
  error: null,
};

export const fetchAdminDashboardData = createAsyncThunk('admin/fetchDashboardData', async (_, { rejectWithValue }) => {
  try {
    const statsData = await adminService.getDashboardStats();
    const usersData = await adminService.getAllUsers();
    return { stats: statsData.data, users: usersData.data };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin data');
  }
});

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ userId, role }: { userId: number, role: string }, { rejectWithValue }) => {
  try {
    await adminService.updateUserRole(userId, role);
    return { userId, role };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update role');
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId: number, { rejectWithValue }) => {
  try {
    await adminService.deleteUser(userId);
    return userId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.users = action.payload.users;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<{ userId: number, role: string }>) => {
        const index = state.users.findIndex(u => u.id === action.payload.userId);
        if (index !== -1) {
          state.users[index].role = action.payload.role as 'admin' | 'teacher' | 'student';
        }
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.stats.totalUsers -= 1;
      });
  },
});

export default adminSlice.reducer;