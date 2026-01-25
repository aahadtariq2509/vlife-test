"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/store/hooks";
import { createDashboardAPI } from "@/lib/dashboard-api";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Users } from "lucide-react";

const DashboardSelection = () => {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Ahad", dashboards.dashboards);

  useEffect(() => {
    const fetchDashboards = async () => {
      // Check if user is authenticated
      if (!isAuthenticated || !accessToken) {
        console.log("Not authenticated or no access token:", {
          isAuthenticated,
          accessToken: !!accessToken,
        });
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        console.log(
          "Fetching dashboards with token:",
          accessToken.substring(0, 20) + "..."
        );
        const api = createDashboardAPI(accessToken);
        const data = await api.fetchDashboards(10, 0);
        console.log("Dashboards fetched successfully:", data);

        // Sort dashboards: user's own dashboards first, then shared dashboards
        if (data.data && data.data.dashboards) {
          const sortedDashboards = [...data.data.dashboards].sort((a, b) => {
            // Own dashboards (is_shared_dashboard = false) come first
            if (!a.is_shared_dashboard && b.is_shared_dashboard) return -1;
            if (a.is_shared_dashboard && !b.is_shared_dashboard) return 1;
            return 0;
          });
          setDashboards({ ...data.data, dashboards: sortedDashboards });
        } else {
          setDashboards(data.data);
        }
      } catch (err) {
        console.error("Error fetching dashboards:", err);

        // Check if error is due to authentication
        if (
          err.message.includes("401") ||
          err.message.includes("unauthorized") ||
          err.message.includes("403")
        ) {
          console.log("Authentication error, redirecting to login");
          // Session expired or unauthorized - redirect to login
          router.push("/login");
          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, [accessToken, isAuthenticated, router]);

  const handleDashboardSelect = (dashboard) => {
    // Navigate to the selected dashboard with dashboard ID as query parameter
    router.push(`/${dashboard.category}?id=${dashboard.id}`);
  };

  // Get local image based on category
  const getCategoryImage = (category) => {
    const images = {
      fitness: "/images/icons/healthcare3.png",
      professional: "/images/icons/suitcase3.png",
      personal: "/images/icons/personal3.png",
    };
    return images[category] || "/images/icons/healthcare3.png";
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboards
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a dashboard to get started with your personalized experience
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards?.dashboards.map((dashboard) => (
            <Card
              key={dashboard.id}
              className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
              onClick={() => handleDashboardSelect(dashboard)}
            >
              {/* Shared Dashboard Indicator */}
              {dashboard.is_shared_dashboard && dashboard.shared_by_name && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>{dashboard.shared_by_name}</span>
                </div>
              )}

              <div className="text-center">
                {/* Dashboard Icon */}
                <div className="my-4 relative text-center flex justify-center">
                  <Image
                    src={getCategoryImage(dashboard.category)}
                    alt={`${dashboard.name} icon`}
                    height={40}
                    width={40}
                    className="object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                </div>

                {/* Dashboard Name */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {dashboard.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {dashboard.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    <span>Open Dashboard</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {dashboards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Dashboards Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Contact your administrator to set up dashboards for your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSelection;
