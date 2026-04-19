import { createSlice } from '@reduxjs/toolkit';

// Load user and token from localStorage
const user = localStorage.getItem('user');
const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!token,
    user: user ? JSON.parse(user) : null,
    token: token || null,
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
