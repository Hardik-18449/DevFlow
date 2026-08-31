import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('devflow_user') || 'null'),
  accessToken: null, // Strictly stored in Redux memory for maximum security (never in localStorage)
  currentOrganization: JSON.parse(localStorage.getItem('devflow_org') || 'null'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, tokens, organization } = action.payload;
      state.user = user || state.user;
      if (tokens?.accessToken) {
        state.accessToken = tokens.accessToken;
      }
      if (user) {
        localStorage.setItem('devflow_user', JSON.stringify(user));
      }
      if (organization) {
        state.currentOrganization = organization;
        localStorage.setItem('devflow_org', JSON.stringify(organization));
      }
    },
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
      localStorage.setItem('devflow_org', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.currentOrganization = null;
      localStorage.removeItem('devflow_token'); // Clean up legacy keys if present
      localStorage.removeItem('devflow_user');
      localStorage.removeItem('devflow_org');
    },
  },
});

export const { setCredentials, setCurrentOrganization, logout } = authSlice.actions;
export default authSlice.reducer;
