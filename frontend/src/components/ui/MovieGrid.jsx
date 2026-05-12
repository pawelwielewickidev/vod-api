import { useQuery, useQueryClient } from '@tanstack/react-query';
import MovieRow from "./MovieRow";

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

export default function MovieGrid() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("vod_token");
  const user = getStoredJson("user");
  const profile = getStoredJson("selected_profile");

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Błąd ładowania kategorii");
      return res.json();
    }
  });

  const hasWatchlistData = Boolean(token && user?.id && profile?.id);

  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist", user?.id, profile?.id],
    enabled: hasWatchlistData,
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
        throw new Error("Błąd ładowania watchlisty");
      }

      return res.json();
    },
  });

  const watchlistMovieIds = new Set(
    watchlist
      .map((item) => item.movie?.id)
      .filter((movieId) => movieId !== undefined && movieId !== null),
  );

  const handleToggleWatchlist = async (movieId) => {
    if (!hasWatchlistData) {
      throw new Error("Brak danych użytkownika lub profilu.");
    }

    const isInWatchlist = watchlistMovieIds.has(movieId);

    const res = await fetch(
      `${API_BASE_URL}/api/users/${user.id}/profiles/${profile.id}/watchlists/${movieId}`,
      {
        method: isInWatchlist ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        isInWatchlist
          ? "Nie udało się usunąć filmu z watchlisty."
          : "Nie udało się dodać filmu do watchlisty.",
      );
    }

    await queryClient.invalidateQueries({
      queryKey: ["watchlist", user.id, profile.id],
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#F47521] text-xl font-bold animate-pulse">Wczytywanie biblioteki...</div>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-400 py-20">{error.message}</div>;
  if (!categories || categories.length === 0) return <div className="text-center text-neutral-500 py-20">Brak kategorii w bazie.</div>;

  return (
    <div className="px-8 md:px-16 py-12 w-full max-w-[1800px] mx-auto">
      {categories.map((category) => (
        <MovieRow
          key={category.id}
          categoryId={category.id}
          categoryName={category.name}
          watchlistMovieIds={watchlistMovieIds}
          onToggleWatchlist={handleToggleWatchlist}
        />
      ))}
    </div>
  );
}