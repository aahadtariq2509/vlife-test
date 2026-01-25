"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Icon } from "@iconify/react";
import { oauthAPI } from "@/lib/oauth-api";
import { useToastContext } from "@/components/providers/ToastProvider";
import { useSearchParams } from "next/navigation";

export default function SocialMediaSection({ isOpen, onClose, accessToken }) {
  const { success, error: showError } = useToastContext();
  const searchParams = useSearchParams();
  const [connectedProviders, setConnectedProviders] = useState({});
  const [oauthWindow, setOauthWindow] = useState(null);

  // Fetch OAuth connection status
  useEffect(() => {
    const fetchOAuthStatus = async () => {
      if (!accessToken) return;

      try {
        const response = await oauthAPI.getConnectedProviders();
        setConnectedProviders(response.data || {});
      } catch (err) {
        console.error("Failed to fetch OAuth connections:", err);
      }
    };

    fetchOAuthStatus();

    // Check for OAuth success redirect
    const oauthSuccess = searchParams.get("oauth");
    const provider = searchParams.get("provider");
    if (oauthSuccess === "success" && provider) {
      success("Success", `${provider} connected successfully!`);
      fetchOAuthStatus(); // Refresh connection status
    }
  }, [accessToken, searchParams]);

  const handleConnectSocialMedia = async (platform) => {
    try {
      let authUrl;

      if (platform === "facebook") {
        const response = await oauthAPI.getFacebookAuthUrl();
        authUrl = response.data?.authorizationUrl || response.authorizationUrl;
      } else if (platform === "twitter") {
        const response = await oauthAPI.getTwitterAuthUrl();
        authUrl = response.data?.authorizationUrl || response.authorizationUrl;
      }

      if (authUrl) {
        // Open OAuth in popup window (centered on screen)
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          authUrl,
          `${platform}_oauth`,
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        setOauthWindow(popup);

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          throw new Error("Popup was blocked. Please allow popups for this site.");
        }
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (err) {
      console.error(`Failed to connect ${platform}:`, err);
      showError("Error", `Failed to connect ${platform}: ${err.message}`);
    }
  };

  const handleDisconnectSocialMedia = async (platform) => {
    try {
      await oauthAPI.disconnectProvider(platform);
      success("Success", `${platform} disconnected successfully`);

      // Update state
      setConnectedProviders({
        ...connectedProviders,
        [platform]: { connected: false },
      });
    } catch (err) {
      console.error(`Failed to disconnect ${platform}:`, err);
      showError("Error", `Failed to disconnect ${platform}: ${err.message}`);
    }
  };

  // Listen for OAuth callback messages from popup window
  useEffect(() => {
    const handleMessage = async (event) => {
      // Security: verify origin if needed
      if (event.data?.type === "oauth-success") {
        const { provider } = event.data;

        // Close the popup window if it's still open
        if (oauthWindow && !oauthWindow.closed) {
          oauthWindow.close();
        }
        setOauthWindow(null);

        success("Success", `${provider} connected successfully!`);

        // Refresh connection status
        try {
          const response = await oauthAPI.getConnectedProviders();
          setConnectedProviders(response.data || {});
        } catch (err) {
          console.error("Failed to refresh OAuth connections:", err);
        }
      } else if (event.data?.type === "oauth-error") {
        // Close the popup window if it's still open
        if (oauthWindow && !oauthWindow.closed) {
          oauthWindow.close();
        }
        setOauthWindow(null);

        showError("Error", event.data.message || "Authentication failed");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [success, showError, oauthWindow]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Social Media"
      size="md"
      className="w-[339px]"
    >
      <div className="space-y-6">
        {/* Facebook */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon
              icon="qlementine-icons:facebook-fill-16"
              className="text-[#3d5a98] rounded"
              width="40"
              height="40"
            />
            <div>
              <p className="font-medium text-[15px] text-[#4D4D4D]">Facebook</p>
              <p className="text-[11px] text-[#00000066]">
                {connectedProviders.facebook?.connected
                  ? "Connected"
                  : "Not connected"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const isConnected = connectedProviders.facebook?.connected;
              if (isConnected) {
                handleDisconnectSocialMedia("facebook");
              } else {
                handleConnectSocialMedia("facebook");
              }
            }}
            className={`h-[41px] rounded-full w-[101px] text-[13px] ${
              connectedProviders.facebook?.connected
                ? "bg-[#E03F2826] text-[#E25C5C] !border-[0.5px] border-[#E25C5C]"
                : "bg-[#77BF5126] text-[#34A853] !border-[0.5px] border-[#77BF51]"
            }`}
          >
            {connectedProviders.facebook?.connected ? "Disconnect" : "Connect"}
          </button>
        </div>

        {/* Twitter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon
              icon="fa7-brands:square-x-twitter"
              width="40"
              height="40"
              className="text-black rounded"
            />
            <div>
              <p className="font-medium text-[15px] text-[#4D4D4D]">Twitter</p>
              <p className="text-[11px] text-[#00000066]">
                {connectedProviders.twitter?.connected
                  ? "Connected"
                  : "Not connected"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const isConnected = connectedProviders.twitter?.connected;
              if (isConnected) {
                handleDisconnectSocialMedia("twitter");
              } else {
                handleConnectSocialMedia("twitter");
              }
            }}
            className={`h-[41px] rounded-full w-[101px] text-[13px] ${
              connectedProviders.twitter?.connected
                ? "bg-[#E03F2826] text-[#E25C5C] !border-[0.5px] border-[#E25C5C]"
                : "bg-[#77BF5126] text-[#34A853] !border-[0.5px] border-[#77BF51]"
            }`}
          >
            {connectedProviders.twitter?.connected ? "Disconnect" : "Connect"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
