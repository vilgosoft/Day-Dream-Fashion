import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  loading: boolean;
}

const initialState: AdminState = {
  isAdminAuthenticated: false,
  adminToken: localStorage.getItem('adminToken'),
  loading: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminCredentials(state, action: PayloadAction<{ token: string }>) {
      state.adminToken = action.payload.token;
      state.isAdminAuthenticated = true;
    },
    adminLogout(state) {
      state.adminToken = null;
      state.isAdminAuthenticated = false;
      localStorage.removeItem('adminToken');
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setAdminCredentials, adminLogout, setLoading } = adminSlice.actions;
export default adminSlice.reducer;
