import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, registerUser, verifyOTP, resendOTP } from './slices/authSlice';
import { clearError, logout } from './slices/authSlice';

// Redux hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback(async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password }));
      if (result.meta.requestStatus === 'fulfilled') {
        return { 
          requireOTP: result.payload.requireOTP, 
          message: 'Login successful' 
        };
      } else {
        throw new Error(result.payload);
      }
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const register = useCallback(async (name, email, password) => {
    try {
      const result = await dispatch(registerUser({ name, email, password }));
      if (result.meta.requestStatus === 'fulfilled') {
        return { 
          requireOTP: result.payload.requireOTP, 
          message: 'Registration successful' 
        };
      } else {
        throw new Error(result.payload);
      }
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const verifyOTPCode = useCallback(async (email, otp, type = 'login') => {
    try {
      const result = await dispatch(verifyOTP({ email, otp, type }));
      if (result.meta.requestStatus === 'fulfilled') {
        return { message: 'OTP verified successfully' };
      } else {
        throw new Error(result.payload);
      }
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const resendOTPCode = useCallback(async (type) => {
    try {
      const result = await dispatch(resendOTP(type ? { type } : {}));
      if (result.meta.requestStatus === 'fulfilled') {
        return { message: 'OTP resent successfully' };
      } else {
        throw new Error(result.payload);
      }
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    verifyOTP: verifyOTPCode,
    resendOTP: resendOTPCode,
    logout,
    clearError,
  };
};
