"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { handleGoogleCallback } from "@/store/slices/authSlice";
import { useToastContext } from "@/components/providers/ToastProvider";

export default function GoogleOAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);
  const { success } = useToastContext();

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        // IMPORTANT: Check if backend already processed and returned data in URL
        // Backend redirects with ?status=success&data={...encoded JSON...}

        const status = searchParams.get("status");
        const dataParam = searchParams.get("data");
        const errorParam = searchParams.get("error");
        const messageParam = searchParams.get("message");
        const provider = searchParams.get("provider");

        // Check if opened in popup (for integrations)
        const isPopup = window.opener && !window.opener.closed;

        // Handle google-calendar integration (not login)
        if (status === "success" && provider === "google-calendar") {
          // Parse callback data if present
          let callbackData = null;
          if (dataParam) {
            try {
              callbackData = JSON.parse(decodeURIComponent(dataParam));
            } catch (e) {
              // Failed to parse callback data
            }
          }

          if (isPopup) {
            // Send success message to parent window
            window.opener.postMessage(
              {
                type: "oauth-success",
                provider: "google-calendar",
                data: callbackData,
              },
              window.location.origin,
            );
            success(
              `${provider} Connected`,
              `Your ${provider} account has been connected successfully`,
            );

            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            // Normal page flow (not in popup) - redirect to settings
            success(
              `${provider} Connected`,
              `Your ${provider} account has been connected successfully`,
            );
            setTimeout(() => {
              router.push("/professional/settings");
            }, 1500);
          }
          return;
        }

        // Handle google-calendar integration error
        if (status === "error" && provider === "google-calendar") {
          if (isPopup) {
            // Send error message to parent window
            window.opener.postMessage(
              {
                type: "oauth-error",
                provider: "google-calendar",
                message: messageParam || "Google Calendar connection failed",
              },
              window.location.origin,
            );

            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            // Normal page flow - show error and redirect
            setError(messageParam || "Google Calendar connection failed");
            setProcessing(false);
            setTimeout(() => {
              router.push("/professional/settings");
            }, 3000);
          }
          return;
        }

        // Check if backend already processed the OAuth callback (login flow)
        if (status === "success" && dataParam) {
          try {
            // Parse the data parameter (it's URL-encoded JSON)
            const callbackData = JSON.parse(decodeURIComponent(dataParam));

            const {
              accessToken,
              refreshToken,
              user,
              expiresIn,
              requireOTP,
              email,
            } = callbackData;

            if (!accessToken || !refreshToken) {
              throw new Error("Missing required authentication data");
            }

            // Store tokens in localStorage
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            // Only store user data if not requiring OTP
            if (!requireOTP) {
              localStorage.setItem("userData", JSON.stringify(user));
            }

            if (expiresIn) {
              const expiryTime = Date.now() + expiresIn * 1000;
              localStorage.setItem("tokenExpiry", expiryTime.toString());
            }

            // Update Redux store
            await dispatch(
              handleGoogleCallback({
                accessToken,
                refreshToken,
                user,
                expiresIn,
                requireOTP,
                email,
              }),
            ).unwrap();

            // Check if OTP verification is required
            if (requireOTP) {
              // Wait for Redux state to fully update before redirecting
              await new Promise((resolve) => setTimeout(resolve, 500));

              setProcessing(false);
              router.push("/verification");
              return;
            }

            // Check if this is a calendar integration (popup mode)
            if (isPopup) {
              window.opener.postMessage(
                {
                  type: "oauth-success",
                  provider: "google-calendar",
                  data: callbackData,
                },
                window.location.origin,
              );

              // Wait a bit before closing
              await new Promise((resolve) => setTimeout(resolve, 1000));
              window.close();
              return;
            }

            // Wait for Redux state to update before redirecting
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Redirect to dashboard (normal login flow)
            setProcessing(false);
            router.push("/dashboards");
            return;
          } catch (parseError) {
            if (isPopup) {
              window.opener.postMessage(
                {
                  type: "oauth-error",
                  provider: "google-calendar",
                  message: "Failed to process authentication data",
                },
                window.location.origin,
              );
              setTimeout(() => window.close(), 2000);
              return;
            }

            setError("Failed to process authentication data");
            setProcessing(false);
            return;
          }
        }

        // Get code from URL params (for manual OAuth flow)
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (errorParam) {
          const errorDescription =
            searchParams.get("error_description") || "Authentication failed";

          if (isPopup) {
            window.opener.postMessage(
              {
                type: "oauth-error",
                provider: "google-calendar",
                message: errorDescription,
              },
              window.location.origin,
            );
            setTimeout(() => window.close(), 2000);
            return;
          }

          setError(errorDescription);
          setProcessing(false);
          return;
        }

        if (!code) {
          if (isPopup) {
            window.opener.postMessage(
              {
                type: "oauth-error",
                provider: "google-calendar",
                message: "Invalid callback - no authorization code received",
              },
              window.location.origin,
            );
            setTimeout(() => window.close(), 2000);
            return;
          }

          setError("Invalid callback - no authorization code received");
          setProcessing(false);
          return;
        }

        try {
          // Call backend to exchange code for tokens
          const baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "https://vlifew.com";

          // Build the callback URL with all parameters
          const callbackUrl = new URL(`${baseUrl}/oauth/google/callback`);
          callbackUrl.searchParams.set("code", code);
          if (state) {
            callbackUrl.searchParams.set("state", state);
          }

          const response = await fetch(callbackUrl.toString(), {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Backend returned ${response.status}: ${response.statusText}`,
            );
          }

          const data = await response.json();

          if (data.status === "success" && data.data) {
            const {
              accessToken,
              refreshToken,
              user,
              expiresIn,
              requireOTP,
              email,
            } = data.data;

            // Store tokens in localStorage
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            // Only store user data if not requiring OTP
            if (!requireOTP) {
              localStorage.setItem("userData", JSON.stringify(user));
            }

            if (expiresIn) {
              const expiryTime = Date.now() + expiresIn * 1000;
              localStorage.setItem("tokenExpiry", expiryTime.toString());
            }

            // Update Redux store
            await dispatch(
              handleGoogleCallback({
                accessToken,
                refreshToken,
                user,
                expiresIn,
                requireOTP,
                email,
              }),
            ).unwrap();

            // Check if OTP verification is required
            if (requireOTP) {
              // Wait for Redux state to fully update before redirecting
              await new Promise((resolve) => setTimeout(resolve, 500));

              setProcessing(false);
              router.push("/verification");
              return;
            }

            // Check if this is a calendar integration (popup mode)
            if (isPopup) {
              window.opener.postMessage(
                {
                  type: "oauth-success",
                  provider: "google-calendar",
                  data: data.data,
                },
                window.location.origin,
              );

              // Wait a bit before closing
              await new Promise((resolve) => setTimeout(resolve, 1000));
              window.close();
              return;
            }

            // Small delay to ensure everything is saved
            setTimeout(() => {
              router.push("/dashboards");
            }, 500);
          } else {
            throw new Error(data.message || "Failed to login with Google");
          }
        } catch (err) {
          if (isPopup) {
            window.opener.postMessage(
              {
                type: "oauth-error",
                provider: "google-calendar",
                message:
                  err.message ||
                  "An unexpected error occurred during authentication",
              },
              window.location.origin,
            );
            setTimeout(() => window.close(), 2000);
            return;
          }

          setError(
            err.message || "An unexpected error occurred during authentication",
          );
          setProcessing(false);
        }
      } catch (outerErr) {
        setError("Failed to process Google authentication");
        setProcessing(false);
      }
    };

    processGoogleCallback();
  }, [searchParams, router, dispatch]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Login Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoadingScreen
      message="Completing Google authentication..."
      subtitle="Please wait while we log you in"
    />
  );
}
