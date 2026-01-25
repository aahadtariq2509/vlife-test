"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastContext } from "@/components/providers/ToastProvider";
import { useAuth } from "@/store/hooks";
import { useDispatch } from "react-redux";
import { initiateGoogleOAuth } from "@/store/slices/authSlice";
import AuthWelcomeSection from "./AuthWelcomeSection";

const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { success, error } = useToastContext();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);

    // If there are validation errors, don't proceed with API call
    if (emailError || passwordError) {
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      // Check if OTP verification is required
      if (result.requireOTP) {
        success(
          "OTP Sent",
          result.message || "Please check your email for verification code",
        );
        router.push("/verification");
      } else {
        success("Login Successful", "Welcome back!");
        router.push("/dashboards");
      }
    } catch (err) {
      error("Login Failed", err.message || "Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      console.log(
        "[LoginScreen] Initiating Google OAuth (full page redirect)...",
      );

      // Get the Google OAuth authorization URL
      const result = await dispatch(initiateGoogleOAuth()).unwrap();
      console.log(
        "[LoginScreen] Received authorization URL:",
        result.authorizationUrl,
      );

      if (result.authorizationUrl) {
        console.log("[LoginScreen] Redirecting to Google...");

        // Store a flag to know we're in OAuth flow
        localStorage.setItem("googleOAuthInProgress", "true");

        // Do a FULL PAGE REDIRECT (not popup)
        window.location.href = result.authorizationUrl;
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (err) {
      console.error("[LoginScreen] Google login error:", err);
      setGoogleLoading(false);
      error(
        "Google Login Failed",
        err.message || "Failed to initiate Google login",
      );
    }
  };

  return (
    <div className="auth-screen-container grid lg:grid-cols-2 ">
      {/* Left Side - Login Form */}
      <div className="auth-form-container flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96 py-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logos/logo.png"
              alt="VLW Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>

          {/* Login Form */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Login
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              Welcome back, please enter your details here.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="john@gmail.com"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={touched.email && errors.email ? errors.email : ""}
                />
              </div>

              {/* Password Field */}
              <div>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={
                    touched.password && errors.password ? errors.password : ""
                  }
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
              >
                Login
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    or
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleGoogleLogin}
                loading={googleLoading}
                disabled={googleLoading || isLoading}
                icon={
                  !googleLoading && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )
                }
                iconPosition="left"
              >
                Continue with Google
              </Button>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an Account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Register Now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="w-full px-4 lg:block hidden">
        <AuthWelcomeSection
          classNamediv={"rounded-[20px] max-h-[901px] w-full lg:block hidden"}
          className={"hidden"}
          showLoggedOutBanner={true}
          paginationDots={[true, true, false, false]}
        />
      </div>
    </div>
  );
};

export default LoginScreen;
