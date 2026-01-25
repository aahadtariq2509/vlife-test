"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Pencil, Save, User, Loader2, X, Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";

export default function page() {
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [originalProfileImage, setOriginalProfileImage] = useState(null);
    const [uploadedImagePath, setUploadedImagePath] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageBlobUrl, setImageBlobUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalFormData, setOriginalFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
    });

    // ✅ Load profile data on mount
    useEffect(() => {
        loadProfile();
    }, []);

    // ✅ Load user profile
    const loadProfile = async () => {
        try {
            setLoadingProfile(true);
            const response = await apiClient.getAuth("/api/user/profile");
            
            if (response.status === "success" && response.data && response.data.user) {
                const profile = response.data.user;
                const loadedData = {
                    name: profile.name || "",
                    email: profile.email || "",
                    phoneNumber: profile.phone_number || "",
                };
                setFormData(loadedData);
                setOriginalFormData(loadedData);
                
                if (profile.profile_image) {
                    // Ensure we have a full URL for the image
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3015";
                    let imageUrl = profile.profile_image;

                    // If it's not already a full URL, construct it
                    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
                        const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
                        imageUrl = `${baseUrl}${cleanPath}`;
                    }

                    // Use direct image URL
                    setProfileImage(imageUrl);
                    setOriginalProfileImage(imageUrl); // Keep original for saving
                    setImageError(false); // Reset error state on new image
                } else {
                    setProfileImage(null);
                    setOriginalProfileImage(null);
                    setImageError(false);
                    if (imageBlobUrl) {
                        URL.revokeObjectURL(imageBlobUrl);
                        setImageBlobUrl(null);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
            toast.error(error.message || "Failed to load profile");
        } finally {
            setLoadingProfile(false);
        }
    };

    // ✅ Handle file upload + preview
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image file");
                return;
            }
            
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }
            
            // Show preview immediately
            setProfileImageFile(file);
            setProfileImage(URL.createObjectURL(file));
            
            // Auto-upload the image
            try {
                setUploadingImage(true);
                toast.loading("Uploading image...", { id: "upload-image" });
                const uploadedPath = await uploadProfileImage(file);
                setUploadedImagePath(uploadedPath);
                toast.success("Image uploaded successfully", { id: "upload-image" });
            } catch (error) {
                console.error("Failed to upload image:", error);
                toast.error(error.message || "Failed to upload image", { id: "upload-image" });
                // Reset on error
                setProfileImageFile(null);
                setProfileImage(originalProfileImage);
                setUploadedImagePath(null);
            } finally {
                setUploadingImage(false);
            }
        }
    };

    // ✅ Handle text input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Load image as blob to bypass CORS issues
    const loadImageAsBlob = async (imageUrl) => {
        try {
            // Try with CORS mode first
            const response = await fetch(imageUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'image/*',
                },
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                // Clean up previous blob URL
                if (imageBlobUrl) {
                    URL.revokeObjectURL(imageBlobUrl);
                }
                
                setImageBlobUrl(blobUrl);
            } else {
                console.warn("Failed to fetch image as blob, will try direct URL");
            }
        } catch (error) {
            // If CORS fails, we'll just use the direct URL in the img tag
            console.warn("Error loading image as blob (CORS issue), will use direct URL:", error.message);
            // Don't set imageBlobUrl, so it will fall back to direct URL
        }
    };

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (imageBlobUrl) {
                URL.revokeObjectURL(imageBlobUrl);
            }
        };
    }, [imageBlobUrl]);

    // ✅ Upload profile image
    const uploadProfileImage = async (file) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3015";
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
            throw new Error("Authentication required");
        }

        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const response = await fetch(`${baseUrl}/api/user/profile-image`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formDataUpload,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to upload image");
        }

        const result = await response.json();
        
        // The API returns file info with structure: { data: { file: { path: "..." } } }
        // We need to construct the full URL by combining baseUrl + path
        let imagePath = null;
        if (result.status === "success" && result.data && result.data.file) {
            imagePath = result.data.file.path;
        } else if (result.data) {
            imagePath = result.data.path || result.data.filename || result.data.url;
        } else {
            imagePath = result.path || result.filename || result.url;
        }
        
        // If path is not already a full URL, prepend the base URL to make it a valid URI
        if (imagePath && !imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
            // Remove leading slash if present and add baseUrl
            const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
            return `${baseUrl}${cleanPath}`;
        }
        
        return imagePath;
    };

    // ✅ Toggle edit mode
    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit - restore original data
            setFormData(originalFormData);
            setProfileImageFile(null);
            setProfileImage(originalProfileImage);
            setUploadedImagePath(null);
        }
        setIsEditing(!isEditing);
    };

    // ✅ Save changes
    const handleSave = async () => {
        try {
            setSaving(true);

            // Prepare update data
            const updateData = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
            };

            // Include profile_image if we have an uploaded path
            // uploadedImagePath contains the path from the profile image upload API
            if (uploadedImagePath) {
                updateData.profile_image = uploadedImagePath;
            }

            // Update profile
            const response = await apiClient.putAuth("/api/user/profile", updateData);

            if (response.status === "success") {
                toast.success("Profile updated successfully!");
                // Clear the file reference and uploaded path since it's now saved
                setProfileImageFile(null);
                setUploadedImagePath(null);
                // Exit edit mode
                setIsEditing(false);
                // Reload profile to get latest data
                await loadProfile();
            } else {
                throw new Error(response.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast.error(error.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-[#3B84E3]" size={24} />
                    <span className="text-gray-600">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex justify-center items-start py-10 px-4">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="mb-6 sm:mb-8 w-full max-w-3xl">
                {/* Heading */}
                <div className="mb-6 sm:mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-[#4D4D4D] mb-1">
                        My Profile
                    </h2>
                    <button
                        onClick={handleEditToggle}
                        className="flex items-center gap-2 px-4 py-2 text-[#3B84E3] hover:bg-[#3B84E3]/10 rounded-full transition"
                        disabled={saving}
                    >
                        {isEditing ? (
                            <>
                                <X size={18} /> Cancel
                            </>
                        ) : (
                            <>
                                <Pencil size={18} /> Edit Profile
                            </>
                        )}
                    </button>
                </div>

                <Card className="p-4 md:p-12 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
                    {/* Profile Image Upload */}
                    <div className="flex justify-center mb-6 relative">
                        <div className="relative w-28 h-28">
                            {profileImage && !profileImage.startsWith("blob:") && !imageError ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-[#3B84E3]"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        console.error("Failed to load profile image:", profileImage);
                                        setImageError(true);
                                    }}
                                    onLoad={(e) => {
                                        console.log("Profile image loaded successfully:", profileImage);
                                        setImageError(false);
                                    }}
                                />
                            ) : profileImage && profileImage.startsWith("blob:") ? (
                                <img
                                    src={profileImage}
                                    alt="Profile Preview"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-[#3B84E3]"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full flex items-center justify-center bg-[#E5E7EB] border-4 border-[#3B84E3]">
                                    <User size={50} className="text-gray-500" />
                                </div>
                            )}

                            {isEditing && (
                                <>
                                    <label
                                        htmlFor="profile-upload"
                                        className="absolute bottom-1 right-1 bg-[#3B84E3] text-white rounded-full p-2 cursor-pointer hover:bg-[#336FC7] transition"
                                    >
                                        <Camera size={18} />
                                    </label>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={saving || uploadingImage}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 w-full">
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 h-12 border-0 rounded-full outline-none bg-[#F3F3F3]"
                                disabled={saving || !isEditing}
                                readOnly={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 font-medium mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full px-4 h-12 border-0 rounded-full outline-none bg-[#F3F3F3]"
                                disabled={saving || !isEditing}
                                readOnly={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 font-medium mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="w-full px-4 h-12 border-0 rounded-full outline-none bg-[#F3F3F3]"
                                disabled={saving || !isEditing}
                                readOnly={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Save Button - Only show when editing */}
                    {isEditing && (
                    <div className="mt-6">
                        <Button
                            className="rounded-full w-full"
                            onClick={handleSave}
                            variant="primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                            <Save size={18} /> Save Changes
                                    </>
                                )}
                        </Button>
                    </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
