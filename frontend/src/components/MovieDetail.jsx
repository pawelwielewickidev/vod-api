import { act, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, Play, Bookmark, Plus, Share2 } from "lucide-react";
import CustomPlayer from "./CustomPlayer";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeEpisode, setActiveEpisode] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const actualMovie = Array.isArray(data) ? data[0] : data;
        setMovie(actualMovie);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania bazy:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="p-20 text-center text-crunchy animate-pulse text-2xl font-cinema">
        Ładowanie danych...
      </div>
    );
  if (!movie)
    return (
      <div className="p-20 text-center text-white">
        Nie znaleziono filmu w bazie.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`http://localhost:8080/api/movies/${movie.id}/bg`}
            alt="Tło"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              console.error(
                "❌ Obrazek tła nie mógł zostać załadowany:",
                e.target.src,
              );

              e.target.src = "https://images.alphacoders.com/133/1331511.jpeg";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        <div className="relative z-10 px-8 md:px-16 w-full max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft size={20} /> Back to main page
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-4 tracking-tighter">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-crunchy">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm font-bold">4.8 (2.5k votes)</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs">
              HD
            </span>
          </div>

          <p className="text-[#A0A0A0] text-lg max-w-2xl mb-8 leading-relaxed line-clamp-4">
            {movie.description ||
              "Ten tytuł oczekuje na rozbudowany opis fabuły..."}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                if (movie.episodes && movie.episodes.length > 0) {
                  setActiveEpisode(movie.episodes[0]);
                } else {
                  alert("Ten film nie ma jeszcze odcinków w bazie!");
                }
              }}
              className="h-12 flex items-center gap-2 bg-[#F47521] hover:bg-[#d9661c] text-neutral-100 px-6 py-3 font-bold rounded-xs transition-colors duration-200"
            >
              <Play fill="currentColor" /> START WATCHING
            </button>
            <button className="h-12 w-12 p-3 border border-neutral-300 hover:bg-neutral-500 rounded-xs transition-colors">
              <Bookmark />
            </button>
            <button className="h-12 w-12 p-3 border border-neutral-300 hover:bg-neutral-500 rounded-xs transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {activeEpisode && (
        <div className="bg-[#0a0a0c] py-16 border-y border-neutral-900">
          <div className="max-w-6xl mx-auto px-8">
            <CustomPlayer
              key={activeEpisode.id}
              streamUrl={`http://localhost:8080${activeEpisode.streamUrl}`}
              title={activeEpisode.title}
              episodeNumber={activeEpisode.episodeNumber}
            />
          </div>
        </div>
      )}

      {movie.episodes && movie.episodes.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 py-12">
          <h3 className="text-2xl font-bold mb-6">All Episodes</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.episodes

              .sort((a, b) => a.episodeNumber - b.episodeNumber)
              .map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => setActiveEpisode(episode)}
                  className={`flex flex-col text-left p-5 rounded-xl border transition-all duration-300 ${
                    activeEpisode?.id === episode.id
                      ? "bg-neutral-800 border-crunchy text-white scale-[1.02] shadow-[0_0_15px_rgba(255,100,0,0.2)]"
                      : "bg-[#0f0f12] border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  <span
                    className={`text-sm font-bold mb-1 ${activeEpisode?.id === episode.id ? "text-crunchy" : "text-neutral-500"}`}
                  >
                    Episode {episode.episodeNumber}
                  </span>
                  <span className="font-medium line-clamp-2 leading-tight">
                    {episode.title}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 md:px-16 py-12 grid md:grid-cols-3 gap-8 border-t border-neutral-900">
        <div>
          <h4 className="text-crunchy font-bold uppercase text-xs tracking-widest mb-2">
            Audio
          </h4>
          <p className="text-white">Japan (Original)</p>
        </div>
        <div>
          <h4 className="text-crunchy font-bold uppercase text-xs tracking-widest mb-2">
            Subtitles
          </h4>
          <p className="text-white">English</p>
        </div>
        <div>
          <h4 className="text-crunchy font-bold uppercase text-xs tracking-widest mb-2">
            Genere
          </h4>
          <p className="text-white">{movie.categoryName || "Akcja, Sci-Fi"}</p>
        </div>
      </div>
    </div>
  );
}
