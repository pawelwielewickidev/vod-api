import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CustomPlayer from "../ui/CustomPlayer";

export default function EpisodeStream() {
  const { movieId, episodeId } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Pobieranie danych o filmie i odcinku
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("vod_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/api/movies/${movieId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("vod_token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const actualMovie = Array.isArray(data) ? data[0] : data;
        setMovie(actualMovie);
        
        const foundEpisode = actualMovie.episodes?.find((ep) => ep.id == episodeId);
        setEpisode(foundEpisode);
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load episode data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, episodeId, navigate]);

  // 2. Generujemy URL do Twojego backendu (Proxy/Redirect)
  // Zauważ: nie robimy tu już fetch(), po prostu tworzymy stringa z adresem
  const streamUrl = episode 
    ? `http://localhost:8080/api/v1/watch/${episode.id}` 
    : null;

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white p-20 text-center animate-pulse text-2xl font-cinema">
        Loading...
      </div>
    );

  if (error)
    return <div className="min-h-screen bg-black text-white p-20 text-center">{error}</div>;

  if (!movie || !episode)
    return <div className="min-h-screen bg-black text-white p-20 text-center">Episode not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sekcja Odtwarzacza */}
      <div className="w-full bg-[#0a0a0a] border-b border-neutral-800">
          <div className="max-w-[1400px] mx-auto pt-8 pb-4 px-4 sm:px-8">
            {streamUrl ? (
                <CustomPlayer
                    streamUrl={streamUrl}
                    title={episode.title}
                    episodeNumber={episode.episodeNumber}
                />
            ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 animate-pulse">
                    Initializing stream...
                </div>
            )}
          </div>
      </div>

      {/* Szczegóły pod odtwarzaczem */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Link
          to={`/movie/${movieId}`}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} /> Back to series page
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-[#F47521]">
          {movie.title}
        </h1>
        <h2 className="text-xl font-semibold mb-4">
          Episode {episode.episodeNumber}: {episode.title}
        </h2>
        <p className="text-neutral-400 leading-relaxed max-w-4xl">
          {episode.epDescription}
        </p>
      </div>

      {/* Lista wszystkich odcinków */}
      {movie.episodes && movie.episodes.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 py-12 border-t border-neutral-900">
          <h3 className="text-2xl font-bold mb-6">All Episodes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.episodes
              .sort((a, b) => a.episodeNumber - b.episodeNumber)
              .map((ep) => (
                <Link
                  key={ep.id}
                  to={`/episode/${movieId}/${ep.id}`}
                  className={`flex flex-col text-left p-5 rounded-xl border transition-all duration-300 ${
                    ep.id == episodeId
                      ? "bg-neutral-800 border-[#F47521] text-white scale-[1.02] shadow-[0_0_15px_rgba(244,117,33,0.15)]"
                      : "bg-[#0f0f12] border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  <span className={`text-sm font-bold mb-1 ${ep.id == episodeId ? "text-[#F47521]" : "text-neutral-500"}`}>
                    Episode {ep.episodeNumber}
                  </span>
                  <span className="font-medium line-clamp-2 leading-tight">
                    {ep.title}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}