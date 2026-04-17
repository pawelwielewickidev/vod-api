import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import CustomPlayer from "./CustomPlayer";

export default function EpisodeStream() {
  const { movieId, episodeId } = useParams();
  const [movie, setMovie] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/movies/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        const actualMovie = Array.isArray(data) ? data[0] : data;
        setMovie(actualMovie);
        const foundEpisode = actualMovie.episodes?.find(
          (ep) => ep.id == episodeId,
        );
        setEpisode(foundEpisode);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, [movieId, episodeId]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white p-20 text-center animate-pulse text-2xl font-cinema">
        Loading...
      </div>
    );

  if (!movie || !episode)
    return (
      <div className="min-h-screen bg-black text-white p-20 text-center">
        Episode not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-8 py-8">
        <CustomPlayer
          streamUrl={`http://localhost:8080${episode.streamUrl}`}
          title={episode.title}
          episodeNumber={episode.episodeNumber}
        />
      </div>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Link
          to={`/movie/${movieId}`}
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} /> Back to series page
        </Link>

        <h1 className="text-3xl font-bold mb-4 text-[#F47521]">
          {movie.title}
        </h1>
        <p className="text-neutral-400 mb-8">
          Episode {episode.episodeNumber}: {episode.title}
        </p>
        <p className="text-neutral-400">{episode.description}</p>
      </div>

      {movie.episodes && movie.episodes.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 py-12">
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
                      ? "bg-neutral-800 border-crunchy text-white scale-[1.02] shadow-[0_0_15px_rgba(255,100,0,0.2)]"
                      : "bg-[#0f0f12] border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  <span
                    className={`text-sm font-bold mb-1 ${
                      ep.id == episodeId ? "text-crunchy" : "text-neutral-500"
                    }`}
                  >
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
