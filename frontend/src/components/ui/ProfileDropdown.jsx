import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Users,
  Settings,
  Bookmark,
  Clock,
  LogOut,
  User,
} from "lucide-react";

const DEFAULT_AVATAR_URL = "/avatar/avatar1.png";

const normalizeAvatarUrl = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== "string") {
    return DEFAULT_AVATAR_URL;
  }

  if (
    avatarUrl.startsWith("http://") ||
    avatarUrl.startsWith("https://") ||
    avatarUrl.startsWith("data:")
  ) {
    return avatarUrl;
  }

  return avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
};

const getStoredProfile = () => {
  const savedProfile = localStorage.getItem("selected_profile");

  if (!savedProfile) {
    return null;
  }

  try {
    return JSON.parse(savedProfile);
  } catch {
    localStorage.removeItem("selected_profile");
    return null;
  }
};

const ProfileAvatar = ({ profile, size = "md", className = "" }) => {
  const avatarUrl = normalizeAvatarUrl(profile?.avatarUrl);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [avatarUrl]);

  const sizeClass = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const iconSizeClass = size === "lg" ? "w-7 h-7" : "w-5 h-5";

  if (hasImageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-neutral-800 border border-neutral-500 flex items-center justify-center text-neutral-300 ${className}`}
      >
        <User className={iconSizeClass} />
      </div>
    );
  }

  return (
    <img
      key={avatarUrl}
      src={avatarUrl}
      alt={profile?.profileName || "Profile avatar"}
      onError={() => setHasImageError(true)}
      className={`${sizeClass} rounded-full object-cover border border-neutral-500 bg-neutral-800 ${className}`}
    />
  );
};

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentProfile(getStoredProfile());
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("vod_token");
    localStorage.removeItem("user");
    localStorage.removeItem("selected_profile");
    setCurrentProfile(null);
    navigate("/login");
  };

  if (!currentProfile) {
    return (
      <div className="h-full px-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
          <User className="w-5 h-5" />
        </div>
      </div>
    );
  }

  const menuItemClass =
    "flex items-center gap-4 px-5 py-3 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors w-full text-left";

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="h-full px-4 flex items-center gap-1.5 hover:bg-neutral-900 transition-colors focus:outline-none">
        <ProfileAvatar profile={currentProfile} />
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-300`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full w-[320px] bg-[#0a0a0a]/95 border border-neutral-800 shadow-2xl flex flex-col z-50 text-sm">
          <div className="p-5 flex items-center gap-4 relative">
            <ProfileAvatar
              profile={currentProfile}
              size="lg"
              className="border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            />
            <div className="flex-1">
              <div className="text-lg font-bold text-white tracking-wide">
                {currentProfile.profileName}
              </div>
            </div>
          </div>

          <hr className="border-neutral-800" />

          <div className="py-2">
            <button
              onClick={() => {
                navigate("/profiles");
                setIsOpen(false);
              }}
              className={menuItemClass}
            >
              <Users className="h-5 w-5 text-neutral-400" />
              Switch Profile
            </button>
            <button className={menuItemClass}>
              <Settings className="h-5 w-5 text-neutral-400" />
              Settings
            </button>
          </div>

          <hr className="border-neutral-800" />

          <div className="py-2">
            <button
              onClick={() => {
                navigate("/watchlist");
                setIsOpen(false);
              }}
              className="flex items-center gap-4 px-5 py-3 text-orange-500 hover:bg-neutral-800 w-full text-left font-medium transition-colors"
            >
              <Bookmark className="h-5 w-5" />
              My watchlist
            </button>
            <button className={menuItemClass}>
              <Clock className="h-5 w-5 text-neutral-400" />
              History
            </button>
          </div>

          <hr className="border-neutral-800" />

          <div className="py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-5 py-3 text-red-500 hover:bg-neutral-800 w-full text-left font-medium transition-colors"
            >
              <LogOut className="h-5 w-5 text-red-600" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
