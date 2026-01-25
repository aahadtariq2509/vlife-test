"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { useDispatch } from "react-redux";
import { restoreAuthState } from "@/store/slices/authSlice";
import DashboardSelection from "@/components/dashboard/DashboardSelection";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function DashboardsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  // Check localStorage on mount and restore auth state if needed
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const userDataStr = localStorage.getItem("userData");

      if (accessToken && refreshToken && userDataStr && !isAuthenticated) {
        console.log(
          "[Dashboards] Found tokens in localStorage, restoring auth state"
        );
        try {
          const userData = JSON.parse(userDataStr);
          dispatch(
            restoreAuthState({
              accessToken,
              refreshToken,
              user: userData,
              isAuthenticated: true,
            })
          );
        } catch (e) {
          console.error("[Dashboards] Failed to parse user data:", e);
        }
      }
      setChecking(false);
    };

    checkAuth();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !checking && !isAuthenticated) {
      // Also check localStorage one more time before redirecting
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("[Dashboards] Not authenticated, redirecting to login");
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, checking, router]);

  if (isLoading || checking) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <DashboardSelection />;
}
