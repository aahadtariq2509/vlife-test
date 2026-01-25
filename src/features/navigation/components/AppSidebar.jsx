"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarMenu } from "@/data";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Icon } from "@iconify/react";
import { createDashboardAPI } from "@/lib/dashboard-api";

export function AppSidebar({ className = "", isOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    logout,
    isLoading: authLoading,
    accessToken,
    isAuthenticated,
  } = useAuth();
  const [openMenus, setOpenMenus] = useState(new Set());
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      // Only fetch if authenticated and have access token
      if (!isAuthenticated || !accessToken) {
        // Fallback to static data if not authenticated
        setMenuItems(sidebarMenu.menuItems || []);
        setMenuLoading(false);
        return;
      }

      try {
        setMenuLoading(true);
        setMenuError(null);
        const api = createDashboardAPI(accessToken);
        const response = await api.fetchDashboards(10, 0);

        // Transform API response to match expected format
        if (response.status === "success" && response.data) {
          // Filter out shared dashboards from the menu
          const filteredDashboards = response.data.dashboards.filter(
            (dashboard) => !dashboard.is_shared_dashboard
          );

          // Define the desired order: Fitness, Personal, Professional
          const categoryOrder = ["fitness", "personal", "professional"];

          // Sort dashboards according to the predefined order
          const sortedDashboards = filteredDashboards.sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.category);
            const indexB = categoryOrder.indexOf(b.category);

            // If category not found in order, put it at the end
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
          });

          setMenuItems(sortedDashboards);
        } else {
          // Fallback to static data if API response is unexpected
          setMenuItems(sidebarMenu.menuItems || []);
        }
      } catch (error) {
        setMenuError(error.message);
        // Fallback to static data on error
        setMenuItems(sidebarMenu.menuItems || []);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenuItems();
  }, [isAuthenticated, accessToken]);

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => {
      // If the clicked menu is already open, close it
      if (prev.has(menuId)) {
        return new Set();
      }
      // Otherwise, close all menus and open only the clicked one
      return new Set([menuId]);
    });
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

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-[300px] bg-white border-r border-gray-200 h-full overflow-y-auto transition-transform duration-300 ease-in-out",
          "fixed lg:relative z-50 lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Logo Section */}
        <div className="relative flex items-center justify-center py-4 px-4">
          <Link
            href="/dashboards"
            className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/logos/logo.png"
              alt="VLW Logo"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4">
          {menuLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400 text-sm">Loading menu...</div>
            </div>
          ) : menuError ? (
            <div className="text-red-500 text-xs px-3 py-2 mb-2">
              Error loading menu: {menuError}
            </div>
          ) : null}
          <ul className="space-y-1">
            {menuItems.length === 0 && !menuLoading ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                No dashboards available
              </li>
            ) : (
              menuItems.map((item) => {
                const isActive =
                  pathname === `/${item.category}` ||
                  pathname.startsWith(`/${item.category}/`);
                const isMenuOpen = openMenus.has(item.id);

                return (
                  <li key={item.id}>
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-3 text-base font-semibold  transition-colors group",
                        isActive
                          ? "bg-[#D9D9D933] text-[#7847FF] rounded-full text-base font-semibold"
                          : "text-[#4D4D4D] hover:bg-gray-50 hover:text-[#7847FF] text-base font-semibold border-b "
                      )}
                    >
                      <Link
                        href={`/${item.category}`}
                        className={cn(
                          "flex items-center flex-1 transition-colors text-base font-semibold",
                          isActive
                            ? "text-[#7847FF]"
                            : "text-[#4D4D4D] hover:text-[#7847FF] text-base font-semibold"
                        )}
                      >
                        <div className="flex items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getCategoryImage(item.category)}
                            alt={`${item.name} icon`}
                            width={30}
                            height={30}
                            className="mr-2.5 flex-shrink-0"
                          />
                          <span className="text-base font-semibold">
                            {item.name}
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMenu(item.id);
                        }}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          isActive ? "hover:bg-[#E8E3FF]" : "hover:bg-gray-100"
                        )}
                      >
                        {isMenuOpen ? (
                          <ChevronDown
                            className={cn(
                              "w-5 h-6 font-bold",
                              isActive ? "text-[#7847FF]" : "text-[#4D4D4D]"
                            )}
                          />
                        ) : (
                          <ChevronRight
                            className={cn(
                              "w-5 h-6 font-bold",
                              isActive ? "text-[#7847FF]" : "text-[#4D4D4D]"
                            )}
                          />
                        )}
                      </button>
                    </div>

                    {/* Submenu */}
                    {isMenuOpen && (
                      <div>
                        <ul className="ml-5 mt-1 space-y-0.5">
                          <li>
                            <Link
                              href={`/${item.category}/settings`}
                              className={cn(
                                "flex items-center px-3 py-2 text-base font-semibold transition-colors",
                                pathname === `/${item.category}/settings`
                                  ? "text-[#9747FF]"
                                  : "text-[#4D4D4D] hover:text-[#7847FF]"
                              )}
                            >
                              <Icon
                                className="mr-2"
                                icon="tdesign:setting-1-filled"
                                width="18"
                                height="18"
                              />
                              Settings
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </nav>

        {/* Logout Section */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={authLoading}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-[#4D4D4D] hover:bg-gray-50 hover:text-[#7847FF] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 mr-2.5" />
              <span className="text-base font-semibold">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
