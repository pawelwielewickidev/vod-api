import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TmdbImage from "./TmbdImage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MovieRow({
  categoryId,
  categoryName,
  watchlistMovieIds = new Set(),
  onToggleWatchlist,
}) {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const [pendingMovieId, setPendingMovieId] = useState(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      enabled: !!categoryId,
      queryKey: ["movies", categoryId],
      initialPageParam: 0,
      queryFn: async ({ pageParam = 0 }) => {
        const token = localStorage.getItem("vod_token");
        if (!token) throw new Error("No authentication token found");

        const params = new URLSearchParams({
          categoryId: String(categoryId),
          page: String(pageParam),
          size: "10",
        });

        const res = await fetch(
          `${API_BASE_URL}/api/movies/search/category?${params}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Backend validation error:", errorData);
          throw new Error(
            errorData.message || `Error ${res.status}: Bad Request`,
          );
        }
        return res.json();
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.last) {
          return undefined;
        }
        return lastPage.number + 1;
      },
    });

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;

      if (
        direction === "right" &&
        hasNextPage &&
        scrollLeft + clientWidth >= scrollWidth - 300
      ) {
        fetchNextPage();
      }

      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth + 100
          : scrollLeft + clientWidth - 100;

      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleWatchlistClick = async (event, movieId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onToggleWatchlist || pendingMovieId) {
      return;
    }

    setPendingMovieId(movieId);

    try {
      await onToggleWatchlist(movieId);
    } catch (error) {
      console.error("Błąd podczas aktualizacji watchlisty:", error);
    } finally {
      setPendingMovieId(null);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const allMovies = data?.pages.flatMap((page) => page.content) || [];

  if (!isLoading && allMovies.length === 0) return null;

  return (
    <div className="mb-16 relative group">
      <h3 className="text-2xl font-cinema text-white mb-8 border-l-4 border-[#F47521] pl-4 tracking-wide">
        {categoryName}
      </h3>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-10 md:-left-14 top-3 bottom-6 z-10 w-10 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ChevronLeft className="text-white w-10 h-10 transition-transform hover:scale-125 hover:text-[#F47521]" />
        </button>

        <div
          ref={rowRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pt-3 pb-8 snap-x no-scrollbar"
        >
          {isLoading &&
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-none w-[calc(50%-0.5rem)] sm:w-[calc(33.33%-0.66rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] xl:w-[calc(16.66%-1rem)] h-64 md:h-80 bg-zinc-800 animate-pulse rounded-md"
              />
            ))}

          {allMovies.map((movie) => {
            const isInWatchlist = watchlistMovieIds.has(movie.id);
            const isPending = pendingMovieId === movie.id;

            return (
              <div
                key={movie.id}
                className="flex-none w-[calc(50%-0.5rem)] sm:w-[calc(33.33%-0.66rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] xl:w-[calc(16.66%-1rem)] snap-start"
              >
                <div
                  onClick={() => handleMovieClick(movie.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleMovieClick(movie.id);
                    }
                  }}
                  className="bg-zinc-900 rounded-md overflow-hidden cursor-pointer transition-all duration-300 origin-bottom hover:scale-105 hover:ring-2 hover:ring-[#F47521] group/card relative shadow-lg h-full"
                >
                  <TmdbImage
                    src={
                      movie.thumbnailPath ||
                      movie.thumbnailUrl ||
                      movie.posterPath
                    }
                    alt={movie.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />

                  <button
                    type="button"
                    onClick={(event) => handleWatchlistClick(event, movie.id)}
                    disabled={isPending}
                    title={
                      isInWatchlist
                        ? "Usuń z watchlisty"
                        : "Dodaj do watchlisty"
                    }
                    aria-label={
                      isInWatchlist
                        ? "Usuń z watchlisty"
                        : "Dodaj do watchlisty"
                    }
                    className={`absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover/card:opacity-100 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isInWatchlist
                        ? "hover:bg-red-600 hover:border-red-500"
                        : "hover:bg-[#F47521] hover:border-[#F47521]"
                    }`}
                  >
                    {isInWatchlist ? (
                      <Minus className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h4 className="text-white font-bold text-sm md:text-base line-clamp-2">
                      {movie.title}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}

          {isFetchingNextPage && (
            <div className="flex-none w-32 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#F47521] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-10 md:-right-14 top-3 bottom-6 z-10 w-10 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ChevronRight className="text-white w-10 h-10 transition-transform hover:scale-125 hover:text-[#F47521]" />
        </button>
      </div>
    </div>
  );
}
