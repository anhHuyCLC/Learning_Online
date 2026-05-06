import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as categoryService from "../services/categoryService";

export interface Category {
  id: number;
  name: string;
  description?: string;
  courseCount?: number;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const getCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>('categories/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await categoryService.getCategories(); 
    return response.data || response.categories || response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  } 
}); 

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;