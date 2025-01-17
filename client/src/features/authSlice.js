import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false, // Add loading state
  error: null, // Add error handling
};

const authSlice = createSlice({
  name: "auth", // Simplified name without "Slice" suffix
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { userLoggedIn, userLoggedOut, setLoading, setError } =
  authSlice.actions;
export default authSlice.reducer;
