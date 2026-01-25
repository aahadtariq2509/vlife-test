import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "@/lib/constants";
import { api } from "@/lib/api-client";

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingVerification: null, // { email, type }
  resetToken: null, // For password reset flow
};

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "Login failed");
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, phoneNumber, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phoneNumber, password }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "Registration failed");
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp, type = "login" }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { accessToken } = state.auth;

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email, otp, type }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "OTP verification failed");
      }

      // Return user data with existing tokens
      return {
        user: result.data.user,
        accessToken,
        refreshToken: state.auth.refreshToken,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { pendingVerification, accessToken } = state.auth;
      const { type } = params;

      if (!pendingVerification?.email) {
        return rejectWithValue("No pending verification found");
      }

      // Use the provided type or fall back to pendingVerification type
      let otpType = type || pendingVerification.type || "login";

      // Convert forgot-password to forgot_password for API compatibility
      if (otpType === "forgot-password") {
        otpType = "forgot_password";
      }

      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: pendingVerification.email,
          type: otpType,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "Failed to resend OTP");
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "Failed to send reset code");
      }

      return { success: true, message: result.message, data: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyResetOTP = createAsyncThunk(
  "auth/verifyResetOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: "forgot_password" }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "OTP verification failed");
      }

      return {
        success: true,
        message: result.message,
        data: result.data,
        resetToken: result.data?.resetToken || result.data?.token,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "Password reset failed");
      }

      return { success: true, message: result.message, data: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { refreshToken: storedRefreshToken } = state.auth;

      // Also check localStorage as fallback
      const refreshTokenValue =
        storedRefreshToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null);

      if (!refreshTokenValue) {
        return rejectWithValue("No refresh token available");
      }

      // Use base URL without /api for auth endpoints
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3015";
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(result.message || "Token refresh failed");
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error.message || "Token refresh failed");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { accessToken } = state.auth;

      if (!accessToken) {
        return rejectWithValue("No access token available");
      }

      const result = await api("/api/user/profile", {
        method: "GET",
      });

      if (result.status !== "success") {
        return rejectWithValue(result.message || "Failed to get profile");
      }

      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initiateGoogleOAuth = createAsyncThunk(
  "auth/initiateGoogleOAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Get Google OAuth authorization URL from backend
      const response = await fetch(`${API_BASE_URL}/oauth/google`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        return rejectWithValue(
          result.message || "Failed to get Google OAuth URL"
        );
      }

      console.log(
        "[authSlice] Got authorization URL from backend:",
        result.data.authorizationUrl
      );

      // Parse the backend's URL
      try {
        const backendUrl = new URL(result.data.authorizationUrl);
        const originalRedirectUri = backendUrl.searchParams.get("redirect_uri");

        console.log(
          "[authSlice] Original redirect_uri from backend:",
          originalRedirectUri
        );

        // Check if backend returned localhost (misconfigured)
        if (originalRedirectUri && originalRedirectUri.includes("localhost")) {
          console.warn(
            "[authSlice] Backend returned localhost redirect_uri, fixing to FRONTEND production URL"
          );

          // Replace localhost with production FRONTEND URL (web.vlifew.com)
          const frontendRedirectUri = `${window.location.origin}/oauth/google/callback`;
          backendUrl.searchParams.set("redirect_uri", frontendRedirectUri);

          console.log(
            "[authSlice] Fixed redirect_uri to:",
            frontendRedirectUri
          );
          console.log(
            "[authSlice] Fixed authorization URL:",
            backendUrl.toString()
          );

          return {
            authorizationUrl: backendUrl.toString(),
          };
        }

        // Backend redirect URI is correct, use as-is
        console.log("[authSlice] Backend redirect URI is correct, using as-is");
        return result.data;
      } catch (e) {
        console.error("[authSlice] Failed to parse/fix URL:", e);
        // If parsing fails, return backend URL as-is
        return result.data;
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const handleGoogleCallback = createAsyncThunk(
  "auth/handleGoogleCallback",
  async ({ accessToken, refreshToken, user, requireOTP, email }, { rejectWithValue }) => {
    try {
      // Store tokens in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Only store user data if not requiring OTP
        if (!requireOTP) {
          localStorage.setItem("userData", JSON.stringify(user));
        }
      }

      return { accessToken, refreshToken, user, requireOTP, email };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { accessToken } = state.auth;

      if (!accessToken) {
        // If no token, just return success (already logged out)
        return { success: true };
      }

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      // Even if API call fails, we should still clear local state
      // The user should be logged out locally regardless of API response
      return {
        success: true,
        apiSuccess: response.ok && result.status === "success",
        message: result.message || "Logged out successfully",
      };
    } catch (error) {
      // Even if API call fails, we should still clear local state
      console.warn("Logout API call failed:", error);
      return {
        success: true,
        apiSuccess: false,
        message: "Logged out locally (API call failed)",
      };
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.pendingVerification = null;
      state.error = null;
      state.resetToken = null;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
      }
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearPendingVerification: (state) => {
      state.pendingVerification = null;
    },
    restoreAuthState: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = action.payload.isAuthenticated ?? true;
      state.pendingVerification = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        // Store tokens in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }

        if (action.payload.requireOTP) {
          state.pendingVerification = {
            email: action.payload.email,
            type: "login",
          };
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = false; // Not authenticated until OTP verified
        } else {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.pendingVerification = null;

          // Store user data in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "userData",
              JSON.stringify(action.payload.user)
            );
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        // Store tokens in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }

        if (action.payload.requireOTP) {
          state.pendingVerification = {
            email: action.payload.email,
            type: "register",
          };
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = false; // Not authenticated until OTP verified
        } else {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.pendingVerification = null;

          // Store user data in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "userData",
              JSON.stringify(action.payload.user)
            );
          }
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.pendingVerification = null;

        // Store user data in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("userData", JSON.stringify(action.payload.user));
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Keep the same pending verification state
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.pendingVerification = {
          email: action.payload.data.email,
          type: "forgot-password",
        };
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Verify Reset OTP
    builder
      .addCase(verifyResetOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyResetOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Store reset token for password reset
        // API returns: { data: { resetToken: "...", email: "..." } }
        state.resetToken =
          action.payload.data?.resetToken ||
          action.payload.resetToken ||
          action.payload.data?.token;
        state.pendingVerification = null;
      })
      .addCase(verifyResetOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.resetToken = null;
        // Password reset successful
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        // Don't set isLoading to true - we want silent refresh
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.error = null;
        // Update tokens
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || state.refreshToken;

        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", action.payload.accessToken);
          if (action.payload.refreshToken) {
            localStorage.setItem("refreshToken", action.payload.refreshToken);
          }
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        // Don't set error - we'll handle logout separately if needed
        // If refresh fails, it means we need to logout
        state.error = null;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Logout User
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.pendingVerification = null;
        state.resetToken = null;

        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userData");
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Even if logout fails, clear the local state
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.pendingVerification = null;
        state.resetToken = null;

        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userData");
        }
      });

    // Google OAuth Initiate
    builder
      .addCase(initiateGoogleOAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateGoogleOAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // authorizationUrl is handled by the component
      })
      .addCase(initiateGoogleOAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Google OAuth Callback
    builder
      .addCase(handleGoogleCallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        // Handle OTP requirement similar to normal login
        if (action.payload.requireOTP) {
          state.pendingVerification = {
            email: action.payload.email,
            type: "login",
          };
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = false; // Not authenticated until OTP verified
        } else {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.pendingVerification = null;
        }
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const {
  clearError,
  logout,
  setTokens,
  clearPendingVerification,
  restoreAuthState,
} = authSlice.actions;
export default authSlice.reducer;
