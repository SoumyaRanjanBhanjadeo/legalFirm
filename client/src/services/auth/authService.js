import api from '../api';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  CREATE_USER: '/auth/create-user',
  GET_ME: '/auth/me',
  GET_USERS: '/auth/users',
  UPDATE_USER: '/auth/users',
  TOGGLE_BLOCK: '/auth/users',
  DELETE_USER: '/auth/users'
};

export const login = async (identifier, password) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
    identifier,
    password
  });
  
  // Store token and user data in localStorage
  if (response.data.success) {
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post(AUTH_ENDPOINTS.CREATE_USER, userData);
  return response.data;
};


export const getMe = async () => {
  const response = await api.get(AUTH_ENDPOINTS.GET_ME);
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 10) => {
  const response = await api.get(AUTH_ENDPOINTS.GET_USERS, {
    params: { page, limit }
  });
  return response.data;
};

export const updateUser = async (userId, updateData) => {
  const response = await api.put(`${AUTH_ENDPOINTS.UPDATE_USER}/${userId}`, updateData);
  return response.data;
};

export const toggleUserBlock = async (userId) => {
  const response = await api.put(`${AUTH_ENDPOINTS.TOGGLE_BLOCK}/${userId}/toggle-block`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`${AUTH_ENDPOINTS.DELETE_USER}/${userId}`);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export default {
  login,
  createUser,
  getMe,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken
};
