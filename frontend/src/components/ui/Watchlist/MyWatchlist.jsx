import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Minus } from "lucide-react";
import TmdbImage from "../TmbdImage.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getStoredJson = (key) => {
  const value = localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export default function MyWatchlist() {
  const token = localStorage.getItem("vod_token");
  const queryClient = useQueryClient();
  const [pendingMovieId, setPendingMovieId] = useState(null);

  const user = useMemo(() => getStoredJson("user"), []);
  const profile = useMemo(() => getStoredJson("selected_profile"), []);

  const hasRequiredData = Boolean(token && user?.id && profile?.id);

  const {
    data: watchlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["watchlist", user?.id, profile?.id],
    enabled: hasRequiredData,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/profiles/${profile.id}/watchlists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Error fetching watchlist");
      }

      return res.json();
    },
  });

  const handleRemoveFromWatchlist = async (event, movieId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!hasRequiredData || pendingMovieId) {
      return;
    }

    setPendingMovieId(movieId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/${user.id}/profiles/${profile.id}/watchlists/${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Nie udało się usunąć filmu z watchlisty.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["watchlist", user.id, profile.id],
      });
    } catch (error) {
      console.error("Błąd podczas usuwania filmu z watchlisty:", error);
    } finally {
      setPendingMovieId(null);
    }
  };

  if (!hasRequiredData) {
    return (
      <div className="pt-24 text-center text-red-400 py-20">
        User or profile not found.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-24 flex justify-center items-center h-64">
        <div className="text-[#F47521] text-xl font-bold animate-pulse">
          Loading watchlist...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 text-center text-red-400 py-20">
        {error.message}
      </div>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="pt-24 text-center text-neutral-500 py-20">
        Your watchlist is empty.
      </div>
    );
  }

  return (
    <div className="px-8 md:px-16 pt-28 pb-12 w-full max-w-[1800px] mx-auto">
      <h2 className="text-3xl font-cinema text-white mb-8 border-l-4 border-[#F47521] pl-4 tracking-wide">
        My Watchlist
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {watchlist.map((item) => {
          const isPending = pendingMovieId === item.movie.id;

          return (
            <Link
              to={`/movie/${item.movie.id}`}
              key={item.movie.id}
              className="bg-zinc-900 rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-[#F47521] group/card relative shadow-lg h-full"
            >
              <TmdbImage
                src={
                  item.movie.thumbnailPath ||
                  item.movie.thumbnailUrl ||
                  item.movie.posterPath
                }
                alt={item.movie.title}
                className="w-full h-64 md:h-80 object-cover"
              />

              <button
                type="button"
                onClick={(event) =>
                  handleRemoveFromWatchlist(event, item.movie.id)
                }
                disabled={isPending}
                title="Usuń z watchlisty"
                aria-label="Usuń z watchlisty"
                className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover/card:opacity-100 hover:scale-110 hover:bg-red-600 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h4 className="text-white font-bold text-sm md:text-base line-clamp-2">
                  {item.movie.title}
                </h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
