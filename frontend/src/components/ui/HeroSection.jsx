import { Play, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [bgUrl, setBgUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🚀 Hero starts loading data...");

    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem("vod_token");

        const response = await fetch("http://localhost:8080/api/movies", {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          console.error("Token wygasł lub jest nieprawidłowy. Wylogowuję...");
          localStorage.removeItem("vod_token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ Found ${data.length} movies. Setting carousel.`);

          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          setMovies(shuffled.slice(0, 5));
        } else {
          setMovies([]);
        }
      } catch (err) {
        console.error("Błąd sieci:", err);
        setError("Brak połączenia z serwerem.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [navigate]);

  useEffect(() => {
    if (movies.length === 0) return;
    const currentMovie = movies[currentIndex];
    if (!currentMovie) return;

    const controller = new AbortController();
    const token = localStorage.getItem("vod_token");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    let bgObjectUrl = null;
    let logoObjectUrl = null;

    const fetchProtectedImage = async (endpoint, setState) => {
      try {
        const response = await fetch(endpoint, {
          headers: authHeaders,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Image fetch failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setState(objectUrl);
        return objectUrl;
      } catch (err) {
        if (err.name === "AbortError") {
          return null;
        }

        console.warn("Protected image load failed:", err);
        setState("");
        return null;
      }
    };

    setBgUrl("");
    setLogoUrl("");
    setLogoLoaded(false);

    fetchProtectedImage(
      `http://localhost:8080/api/movies/${currentMovie.id}/bg`,
      setBgUrl,
    ).then((url) => {
      bgObjectUrl = url;
    });

    if (currentMovie.logoPath) {
      fetchProtectedImage(
        `http://localhost:8080/api/movies/${currentMovie.id}/logo`,
        setLogoUrl,
      ).then((url) => {
        logoObjectUrl = url;
      });
    }

    return () => {
      controller.abort();
      if (bgObjectUrl) URL.revokeObjectURL(bgObjectUrl);
      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
    };
  }, [currentIndex, movies]);

  useEffect(() => {
    if (movies.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      setLogoLoaded(false);
    }, 10000);

    return () => clearInterval(timer);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    setLogoLoaded(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1,
    );
    setLogoLoaded(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] min-h-[500px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <span className="text-neutral-500 font-bold text-xl">
          Loading premiere...
        </span>
      </div>
    );
  }

  if (movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative px-10 w-full h-[75vh] min-h-[500px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          key={currentMovie.id}
          src={
            bgUrl ||
            currentMovie.thumbnailUrl ||
            `https://images.alphacoders.com/133/1331511.jpeg`
          }
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent"></div>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent"></div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-1 z-30 p-2 text-white/40 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-all hover:scale-110"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-1 z-30 p-2 text-white/40 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-all hover:scale-110"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      <div className="relative z-10 px-2 md:px-10 w-full flex flex-col max-w-3xl gap-5">
        <div className="flex flex-col items-start gap-6">
          {currentMovie.logoPath && logoUrl ? (
            <img
              key={currentMovie.id}
              src={logoUrl}
              alt={currentMovie.title}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(false)}
              className="max-h-32 object-contain"
            />
          ) : null}

          <div className="w-full">
            {!currentMovie.logoPath || !logoLoaded ? (
              <h1 className="text-5xl md:text-7xl font-cinema text-white leading-tight">
                {currentMovie.title}
              </h1>
            ) : null}

            <div className="flex items-center gap-3 text-sm text-neutral-300 font-medium">
              <span className="bg-neutral-800 text-neutral-100 px-2 py-0.5 rounded">
                12+
              </span>
              <span>• {currentMovie.categoryName || "Anime • Action"}</span>
            </div>

            <p className="text-neutral-300 text-lg leading-relaxed line-clamp-3">
              {currentMovie.description ||
                "No description in database. Add description via Spring Boot panel!"}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <button className="flex items-center gap-2 bg-[#F47521] hover:bg-[#d9661c] text-white px-6 py-3 font-bold rounded transition-colors duration-200">
                <Play className="w-5 h-5 fill-current" />
                START WATCHING E1
              </button>

              <button className="flex items-center justify-center border-2 border-[#F47521] text-[#F47521] hover:bg-[#F47521] hover:text-white p-3 rounded transition-colors duration-200">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute px-4 bottom-25 left-17 z-20 flex items-center gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? "w-8 bg-[#F47521]"
                : "w-4 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
