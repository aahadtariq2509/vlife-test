"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import { createDashboardAPI } from "@/lib/dashboard-api";
import DynamicDashboard from "@/components/dashboard/DynamicDashboard";
import Image from "next/image";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function FitnessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboardId = searchParams.get('id'); // Get dashboard ID from URL query parameter
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const { handleAuthError } = useAuthErrorHandler();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !accessToken) {
        console.log("Fitness page: Not authenticated or no access token:", {
          isAuthenticated,
          accessToken: !!accessToken,
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(
          "Fitness page: Fetching dashboards with token:",
          accessToken.substring(0, 20) + "..."
        );

        const api = createDashboardAPI(accessToken);
        let selectedDashboardId;

        // If dashboard ID is provided in URL, use it directly
        if (dashboardId) {
          console.log("Fitness page: Using dashboard ID from URL:", dashboardId);
          selectedDashboardId = dashboardId;
        } else {
          // Otherwise, auto-select fitness dashboard from list
          const dashboardsResponse = await api.fetchDashboards(10, 0);
          // console.log(
          //   "Fitness page: Dashboards response:",
          //   JSON.stringify(dashboardsResponse, null, 2)
          // );

          // Find the user's OWN fitness dashboard (not shared ones)
          // CRITICAL: When navigating via sidebar, always use owner's dashboard, never shared
          const fitnessDashboards = dashboardsResponse.data.dashboards.filter(
            (dashboard) =>
              (dashboard.category === "fitness" ||
                dashboard.name.toLowerCase().includes("fitness")) &&
              !dashboard.is_shared_dashboard // Exclude shared dashboards
          );

          // Get the first owned fitness dashboard
          const fitnessDashboard = fitnessDashboards[0];

          if (!fitnessDashboard) {
            console.log(
              "Fitness page: No fitness dashboard found. Available dashboards:",
              dashboardsResponse?.data.dashboards.map((d) => ({
                id: d.id,
                name: d.name,
                category: d.category,
              }))
            );
            throw new Error("Fitness dashboard not found");
          }

          console.log(
            "Fitness page: Found fitness dashboard:",
            JSON.stringify(fitnessDashboard, null, 2)
          );
          selectedDashboardId = fitnessDashboard.id;
        }

        // Fetch the specific dashboard data using the selected ID
        const dashboardData = await api.fetchDashboardData(selectedDashboardId);
        console.log(
          "Fitness page: Dashboard data:",
          JSON.stringify(dashboardData, null, 2)
        );

        // Log detailed information about the dashboard structure
        console.log(
          "Fitness page: Dashboard widgets:",
          dashboardData.data?.widgets?.length || 0
        );
        console.log(
          "Fitness page: Dashboard attributes:",
          dashboardData.data?.dashboard_attributes?.length || 0
        );

        if (dashboardData.data?.widgets) {
          dashboardData.data.widgets.forEach((widget, index) => {
            console.log(`Fitness page: Widget ${index}:`, {
              id: widget.id,
              name: widget.name,
              widget_type: widget.widget_type?.code,
              attribute_id: widget.attribute_id,
              config: widget.config,
            });
          });
        }

        if (dashboardData.data?.dashboard_attributes) {
          dashboardData.data.dashboard_attributes.forEach((attr, index) => {
            console.log(`Fitness page: Attribute ${index}:`, {
              attribute_id: attr.attribute_id,
              name: attr.name,
              display_name: attr.display_name,
              values_count: attr.values?.length || 0,
              attributes_count: attr.attributes?.length || 0,
            });
          });
        }

        setData(dashboardData.data);
      } catch (err) {
        console.error("Error fetching fitness dashboard:", err);

        // Handle authentication errors
        const wasAuthError = await handleAuthError(err);
        if (wasAuthError) {
          return; // Error was handled, don't set error state
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, accessToken, router, dashboardId]);

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900  mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600  mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold text-[#4D4D4D]  mb-1">
            {data.name || "Health Dashboard"}
          </h1>
          <button
            onClick={() => setShowHeatmap((prev) => !prev)}
            aria-pressed={showHeatmap}
            className={`flex items-center justify-center gap-3 w-[159px] h-12 border-2 ring-1 uppercase rounded-full text-[15px] font-medium transition ${
              showHeatmap
                ? "bg-[#559EFE] text-white border-[#559EFE]"
                : "bg-[#559EFE1A] text-[#4D4D4D] border-[#559EFE]"
            }`}
          >
            <Image
              src="/images/icons/Heatmap.svg"
              width={30}
              height={30}
              alt=""
              className="w-5 h-5"
            />
            Heatmap
          </button>
        </div>
        <p className="text-sm font-medium text-[#4D4D4D]">
          {data.description || "Track your health and fitness metrics"}
        </p>
      </div>

      {/* Main Content - No inner scroll, uses main page scroll */}
      <DynamicDashboard
        dashboardData={{ data }}
        showHeatmap={showHeatmap}
        onCloseHeatmap={() => setShowHeatmap(false)}
      />
    </div>
  );
}
