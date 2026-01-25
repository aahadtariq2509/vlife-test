'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser, 
  registerUser, 
  verifyOTP, 
  resendOTP as resendOTPAction,
  forgotPassword as forgotPasswordAction,
  verifyResetOTP as verifyResetOTPAction,
  resetPassword as resetPasswordAction,
  getProfile,
  logoutUser as logoutUserAction,
  refreshToken as refreshTokenAction,
  logout,
  clearError,
  clearPendingVerification,
  restoreAuthState
} from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const hasInitializedRef = React.useRef(false);

  // Initialize auth state from localStorage on mount
  React.useEffect(() => {
    // Prevent duplicate initialization
    if (hasInitializedRef.current) return;
    
    const initializeAuth = () => {
      if (typeof window !== 'undefined') {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUserData = localStorage.getItem('userData');

        if (storedAccessToken && storedRefreshToken && !authState.isAuthenticated) {
          // Restore user data if available
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              // Dispatch action to restore auth state
              dispatch(restoreAuthState({
                user: userData,
                accessToken: storedAccessToken,
                refreshToken: storedRefreshToken,
                isAuthenticated: true
              }));
            } catch (error) {
              console.error('Error parsing stored user data:', error);
            }
          }
        }
        setIsHydrated(true);
        hasInitializedRef.current = true;
      }
    };

    initializeAuth();
  }, [dispatch, authState.isAuthenticated]);

  // Auth actions
  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    return result.payload;
  };

  const register = async (name, email, phoneNumber, password) => {
    const result = await dispatch(registerUser({ name, email, phoneNumber, password }));
    return result.payload;
  };

  const verifyOTPCode = async (otp) => {
    // Check if this is a forgot-password flow or login/registration flow
    const verificationType = authState.pendingVerification?.type || 'login';
    const email = authState.pendingVerification?.email;
    
    // For forgot-password flow, use verifyResetOTP
    if (verificationType === 'forgot-password') {
      if (!email) {
        throw new Error('Email is required for password reset verification');
      }
      const result = await dispatch(verifyResetOTPAction({ email, otp }));
      return result.payload;
    }
    
    // For login/registration flow, use verifyOTP
    const result = await dispatch(verifyOTP({ 
      email: email,
      otp,
      type: verificationType
    }));
    return result.payload;
  };

  const resendOTP = async (type) => {
    const result = await dispatch(resendOTPAction(type ? { type } : {}));
    return result.payload;
  };

  const logoutUser = async () => {
    const result = await dispatch(logoutUserAction());
    return result.payload;
  };

  const forgotPassword = async (email) => {
    const result = await dispatch(forgotPasswordAction({ email }));
    
    if (result.type.endsWith('/rejected')) {
      throw new Error(result.payload || 'Failed to send reset code');
    }
    
    return result.payload;
  };

  const verifyResetOTP = async (email, otp) => {
    const result = await dispatch(verifyResetOTPAction({ email, otp }));
    return result.payload;
  };

  const resetPassword = async (newPassword) => {
    const result = await dispatch(resetPasswordAction({ 
      resetToken: authState.resetToken, 
      newPassword 
    }));
    return result.payload;
  };

  const refreshAccessToken = async () => {
    const result = await dispatch(refreshTokenAction());
    if (result.type.endsWith('/rejected')) {
      throw new Error(result.payload || 'Token refresh failed');
    }
    return result.payload;
  };

  return {
    // State
    user: authState.user,
    accessToken: authState.accessToken,
    refreshToken: authState.refreshToken,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || !isHydrated,
    error: authState.error,
    pendingVerification: authState.pendingVerification,
    resetToken: authState.resetToken,
    isHydrated,

    // Actions
    login,
    register,
    verifyOTP: verifyOTPCode,
    resendOTP,
    logout: logoutUser,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    refreshAccessToken,
    clearError: () => dispatch(clearError()),
    clearPendingVerification: () => dispatch(clearPendingVerification()),
  };
}