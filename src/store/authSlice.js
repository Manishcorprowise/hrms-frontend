import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        return result;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ email, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const result = await authService.updatePassword(email, oldPassword, newPassword);
      if (result.success) {
        return result;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initialize state from localStorage
const initializeAuthState = () => {
  const user = authService.getUserInfo();
  const isAuthenticated = authService.isAuthenticated();
  
  return {
    user: user,
    isAuthenticated: isAuthenticated,
    isLoading: false,
    error: null,
    isPasswordUpdateLoading: false,
    passwordUpdateError: null
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: initializeAuthState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordUpdateError: (state) => {
      state.passwordUpdateError = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.passwordUpdateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Password update cases
      .addCase(updatePassword.pending, (state) => {
        state.isPasswordUpdateLoading = true;
        state.passwordUpdateError = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isPasswordUpdateLoading = false;
        state.passwordUpdateError = null;
        // Update user state with the response data
        if (action.payload && action.payload.user) {
          state.user = {
            ...state.user,
            ...action.payload.user
          };
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isPasswordUpdateLoading = false;
        state.passwordUpdateError = action.payload;
      });
  }
});

export const { clearError, clearPasswordUpdateError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
