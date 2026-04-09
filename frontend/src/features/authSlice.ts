import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import * as authService from '../services/authService';
import apiClient from '../services/apiClient';

// Định nghĩa interface cho User. Đảm bảo có thuộc tính 'balance'.
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  balance: number; // Đã thêm thuộc tính balance
  avatar?: string;
  created_at: string;
}

// Định nghĩa interface cho dữ liệu đăng nhập
interface LoginData {
  email: string;
  password: string;
}

// Định nghĩa interface cho dữ liệu đăng ký
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Định nghĩa interface cho dữ liệu cập nhật
interface UpdateProfileData {
  name: string;
  currentPassword?: string;
  password?: string;
}

// Định nghĩa interface cho trạng thái xác thực
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Khởi tạo trạng thái ban đầu từ localStorage
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Thunk để đăng nhập người dùng
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData: LoginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(userData.email, userData.password);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Đăng nhập thất bại.');
      }
      return rejectWithValue(error.message || 'Lỗi mạng.');
    }
  }
);

// Thunk để đăng ký người dùng
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData.name, userData.email, userData.password);
      return response;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        // Trả về thông báo lỗi từ backend
        return rejectWithValue(error.response.data.message || 'Đăng ký thất bại.');
      }
      return rejectWithValue(error.message || 'Lỗi mạng.');
    }
  }
);

// Thunk mới: topUpBalance để nạp tiền vào tài khoản
export const topUpBalance = createAsyncThunk(
  'auth/topUpBalance',
  async (amount: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user; // Lấy thông tin user hiện tại

      if (!currentUser) { 
        return rejectWithValue('Không có thông tin người dùng. Vui lòng đăng nhập lại.');
      }

      const response = await apiClient.post('/users/top-up', { amount });
    
      const updatedUser = { ...currentUser, balance: response.data.newBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return response.data; // Trả về dữ liệu từ server (bao gồm newBalance và message)
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        // Trả về thông báo lỗi từ backend nếu có
        return rejectWithValue(error.response.data.message || 'Lỗi khi nạp tiền.');
      }
      return rejectWithValue(error.message || 'Lỗi mạng.');
    }
  }
);

// Thunk để cập nhật thông tin người dùng
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData: UpdateProfileData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;

      if (!currentUser) {
        return rejectWithValue('Không có thông tin người dùng. Vui lòng đăng nhập lại.');
      }

      const response = await apiClient.put('/users/update-user', profileData);
     
      const updatedUser = { ...currentUser, name: profileData.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return { ...response.data, user: updatedUser };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Lỗi khi cập nhật thông tin.');
      }
      return rejectWithValue(error.message || 'Lỗi mạng.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Xử lý registerUser thunk
      .addCase(registerUser.pending, (state, _action) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, _action) => { state.loading = false; state.error = null; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      // Xử lý topUpBalance thunk
      .addCase(topUpBalance.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(topUpBalance.fulfilled, (state, action: PayloadAction<{ success: boolean; message: string; newBalance: number }>) => {
        state.loading = false;
        if (state.user) { state.user.balance = action.payload.newBalance; }
        state.error = null;
      })
      .addCase(topUpBalance.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      // Xử lý updateUserProfile thunk
      .addCase(updateUserProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) { 
          state.user.name = action.payload.user.name; 
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;