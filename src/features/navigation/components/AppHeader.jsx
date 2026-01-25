"use client";

import Image from "next/image";
import { Menu, LogOut, User, MoreVertical } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export function AppHeader({ onMenuClick }) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  // Fetch profile image on mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await apiClient.getAuth("/api/user/profile");

        if (
          response.status === "success" &&
          response.data &&
          response.data.user
        ) {
          const profile = response.data.user;

          if (profile.profile_image) {
            // Ensure we have a full URL for the image
            const baseUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3015";
            let imageUrl = profile.profile_image;

            // If it's not already a full URL, construct it
            if (
              !imageUrl.startsWith("http://") &&
              !imageUrl.startsWith("https://")
            ) {
              const cleanPath = imageUrl.startsWith("/")
                ? imageUrl
                : `/${imageUrl}`;
              imageUrl = `${baseUrl}${cleanPath}`;
            }

            // Use direct image URL
            setProfileImage(imageUrl);
            setImageError(false);
          } else {
            // No profile image, use fallback
            setProfileImage(null);
            setImageError(false);
          }
        }
      } catch (error) {
        // On error, use fallback image
        setProfileImage(null);
        setImageError(false);
      }
    };

    fetchProfileImage();
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-1 bg-gray-100"></div>

      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Notification */}
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Image
                  src="/images/icons/bell.png"
                  alt="Notifications"
                  width={20}
                  height={20}
                  className="opacity-60"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(30%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                    width: "auto",
                    height: "auto",
                  }}
                />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            </div>
            <button className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-gray-200">
              <Image
                src={
                  profileImage && !imageError
                    ? profileImage
                    : "/images/avatars/profile.png"
                }
                alt={`${user?.name || "User"} avatar`}
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // If profile image fails, fallback to static image
                  if (profileImage && !imageError) {
                    setImageError(true);
                    e.target.src = "/images/avatars/profile.png";
                  } else {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }
                }}
              />
              <div className="w-5 h-5 text-gray-600 hidden" />
            </button>
            {/* 3-dots dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="User menu"
              >
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2 text-gray-600" />
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full text-left flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-gray-600" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
