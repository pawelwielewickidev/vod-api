import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const AvatarImage = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  const normalizedSrc = normalizeAvatarUrl(src);
  const imageSrc = hasError ? DEFAULT_AVATAR_URL : normalizedSrc;

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  return (
    <img
      key={imageSrc}
      src={imageSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
    />
  );
};

const ProfileScreen = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);

  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR_URL);

  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState(DEFAULT_AVATAR_URL);

  const avatarOptions = [
    "/avatar/avatar1.png",
    "/avatar/avatar2.png",
    "/avatar/avatar3.png",
    "/avatar/avatar4.png",
    "/avatar/avatar5.png",
    "/avatar/avatar6.png",
    "/avatar/avatar7.png",
    "/avatar/avatar8.png",
    "/avatar/avatar9.png",
    "/avatar/avatar10.png",
  ];

  const getSelectedProfile = () => {
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

  const updateSelectedProfileIfNeeded = (updatedProfile) => {
    const selectedProfile = getSelectedProfile();

    if (selectedProfile?.id === updatedProfile.id) {
      localStorage.setItem(
        "selected_profile",
        JSON.stringify({
          ...updatedProfile,
          avatarUrl: normalizeAvatarUrl(updatedProfile.avatarUrl),
        }),
      );
    }
  };

  const clearSelectedProfileIfNeeded = (profileId) => {
    const selectedProfile = getSelectedProfile();

    if (selectedProfile?.id === profileId) {
      localStorage.removeItem("selected_profile");
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      return;
    }

    const token = localStorage.getItem("vod_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileName: newProfileName.trim(),
            avatarUrl: normalizeAvatarUrl(selectedAvatar),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const newProfile = await response.json();

      setProfiles((prev) => [
        ...prev,
        {
          ...newProfile,
          avatarUrl: normalizeAvatarUrl(newProfile.avatarUrl),
        },
      ]);
      setIsCreatingProfile(false);
      setNewProfileName("");
      setSelectedAvatar(DEFAULT_AVATAR_URL);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("vod_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          console.error("Bad Request Details:", errorData);
          throw new Error("Bad Request: Check token format or server logs.");
        }

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("vod_token");
          localStorage.removeItem("user");
          localStorage.removeItem("selected_profile");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const controller = new AbortController();
    const token = localStorage.getItem("vod_token");

    const fetchProfiles = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/${user.id}/profiles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("vod_token");
          localStorage.removeItem("user");
          localStorage.removeItem("selected_profile");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        setProfiles(
          data.map((profile) => ({
            ...profile,
            avatarUrl: normalizeAvatarUrl(profile.avatarUrl),
          })),
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error loading profiles:", err);
        }
      }
    };

    fetchProfiles();

    return () => controller.abort();
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!user?.id || !editingProfile?.id) {
      return;
    }

    const token = localStorage.getItem("vod_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/profiles/${editingProfile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileName: editName.trim(),
            avatarUrl: normalizeAvatarUrl(editAvatar),
          }),
        },
      );

      if (response.status === 404) {
        alert("The profile you are trying to update could not be found.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const updatedProfileFromApi = await response.json();
      const updatedProfile = {
        ...updatedProfileFromApi,
        avatarUrl: normalizeAvatarUrl(updatedProfileFromApi.avatarUrl),
      };

      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === editingProfile.id ? updatedProfile : profile,
        ),
      );

      updateSelectedProfileIfNeeded(updatedProfile);
      setEditingProfile(null);
      setEditName("");
      setEditAvatar(DEFAULT_AVATAR_URL);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user?.id || !editingProfile?.id) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete the profile: ${editingProfile.profileName}?`,
      )
    ) {
      return;
    }

    const token = localStorage.getItem("vod_token");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/profiles/${editingProfile.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok && response.status !== 204) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      const deletedProfileId = editingProfile.id;

      setProfiles((prevProfiles) =>
        prevProfiles.filter((profile) => profile.id !== deletedProfileId),
      );

      clearSelectedProfileIfNeeded(deletedProfileId);
      setEditingProfile(null);
      setEditName("");
      setEditAvatar(DEFAULT_AVATAR_URL);
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleSelectProfile = (profile) => {
    localStorage.setItem(
      "selected_profile",
      JSON.stringify({
        ...profile,
        avatarUrl: normalizeAvatarUrl(profile.avatarUrl),
      }),
    );

    navigate("/home");
  };

  const onProfileClick = (profile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setEditName(profile.profileName);
      setEditAvatar(normalizeAvatarUrl(profile.avatarUrl));
    } else {
      handleSelectProfile(profile);
    }
  };

  return (
    <div className="min-h-screen bg-[#141519] flex flex-col justify-center items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#141519] to-[#141519] z-0"></div>
      <div
        className="absolute inset-0 opacity-20 z-0"
        style={{
          backgroundImage: 'url("/58200.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {isCreatingProfile ? (
        <div className="z-10 w-full max-w-3xl text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
            Add new profile
          </h1>

          <form onSubmit={handleCreateProfile} className="space-y-12">
            <div>
              <input
                type="text"
                placeholder="Profile name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="bg-black/80 border-2 border-orange-500 text-white text-2xl text-center px-6 py-4 rounded w-full max-w-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all shadow-lg"
                required
                maxLength={15}
              />
            </div>

            <div>
              <h2 className="text-gray-400 text-lg font-medium mb-6 uppercase tracking-widest">
                Choose avatar
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                {avatarOptions.map((path) => (
                  <div
                    key={path}
                    onClick={() => setSelectedAvatar(path)}
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full p-1 cursor-pointer transition-all duration-300 transform ${
                      selectedAvatar === path
                        ? "border-4 border-orange-500 scale-110 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                        : "border-4 border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <AvatarImage
                      src={path}
                      className="w-full h-full rounded-full bg-gray-800 object-cover"
                      alt="Avatar option"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProfile(false);
                  setNewProfileName("");
                  setSelectedAvatar(DEFAULT_AVATAR_URL);
                }}
                className="border border-gray-400 text-gray-400 font-semibold px-8 py-3 rounded-lg hover:text-white hover:border-orange-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newProfileName.trim()}
                className="bg-orange-500 text-black font-bold text-lg px-10 py-3 rounded-lg hover:bg-orange-400 hover:text-black disabled:bg-gray-700 disabled:text-gray-500 transition-colors shadow-lg"
              >
                Save profile
              </button>
            </div>
          </form>
        </div>
      ) : editingProfile ? (
        <div className="z-10 w-full max-w-3xl text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
            Edit profile: {editingProfile.profileName}
          </h1>

          <form onSubmit={handleUpdateProfile} className="space-y-12">
            <div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-[#1a1c23] border border-gray-700 text-white text-2xl text-center px-6 py-4 rounded w-full max-w-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all shadow-lg"
                required
                maxLength={15}
              />
            </div>

            <div>
              <h2 className="text-gray-400 text-lg font-medium mb-6 uppercase tracking-widest">
                Change Avatar
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                {avatarOptions.map((path) => (
                  <div
                    key={path}
                    onClick={() => setEditAvatar(path)}
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full p-1 cursor-pointer transition-all duration-300 transform ${
                      editAvatar === path
                        ? "border-4 border-orange-500 scale-110 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                        : "border-4 border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <AvatarImage
                      src={path}
                      className="w-full h-full rounded-full bg-gray-800 object-cover"
                      alt="Avatar option"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 pt-4 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(null);
                  setEditName("");
                  setEditAvatar(DEFAULT_AVATAR_URL);
                }}
                className="border border-gray-600 text-gray-400 font-semibold px-6 py-3 rounded hover:text-white hover:border-orange-500 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProfile}
                className="border border-red-900 bg-red-900/30 text-red-500 font-semibold px-6 py-3 rounded hover:bg-red-800 hover:text-white hover:border-red-800 transition-colors"
              >
                Delete Profile
              </button>

              <button
                type="submit"
                disabled={!editName.trim()}
                className="bg-orange-500 text-black font-bold text-lg px-8 py-3 rounded hover:bg-orange-400 hover:text-black disabled:bg-gray-700 disabled:text-gray-500 transition-colors shadow-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="z-10 -translate-y-13 text-center w-full max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12">
            Who is watching?
          </h1>

          <div className="flex justify-center gap-6 md:gap-10 flex-wrap">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onProfileClick(profile)}
                className="group flex flex-col items-center cursor-pointer"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500 transition-all duration-300 transform group-hover:scale-105 shadow-lg">
                  <AvatarImage
                    src={profile.avatarUrl}
                    alt={profile.profileName}
                    className="w-full h-full object-cover bg-amber-800"
                  />

                  {isManaging && (
                    <div className="absolute inset-0 flex justify-center items-center bg-black/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <span className="mt-4 text-gray-400 group-hover:text-white font-medium text-lg transition-colors">
                  {profile.profileName}
                </span>
              </div>
            ))}

            {!isManaging && (
              <div
                onClick={() => setIsCreatingProfile(true)}
                className="group flex flex-col items-center cursor-pointer"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-orange-400 flex justify-center items-center group-hover:border-orange-500 group-hover:bg-amber-800 transition-all duration-300 transform group-hover:scale-105">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-500 group-hover:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>

                <span className="mt-4 text-gray-400 group-hover:text-white font-medium text-lg transition-colors">
                  Add profile
                </span>
              </div>
            )}
          </div>

          <div className="mt-16">
            <button
              onClick={() => setIsManaging(!isManaging)}
              className="border border-gray-500 text-gray-400 hover:text-white hover:border-orange-500 px-6 py-2 uppercase tracking-widest text-sm font-semibold transition-colors"
            >
              {isManaging ? "Done" : "Manage Profiles"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
