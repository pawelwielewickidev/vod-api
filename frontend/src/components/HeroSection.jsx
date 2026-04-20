import { Play, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    console.log("🚀 Hero starts loading data...");

    fetch("http://localhost:8080/api/movies")
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ Found ${data.length} movies. Setting carousel.`);

          let shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          setMovies(shuffled.slice(0, 5));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("❌ Critical error in Hero:", error);
        setIsLoading(false);
      });
  }, []);

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
    <div className="relative w-full h-[75vh] min-h-[500px] flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          key={currentMovie.id}
          src={
            // eslint-disable-next-line no-constant-binary-expression
            `http://localhost:8080/api/movies/${currentMovie.id}/bg` ||
            currentMovie.thumbnailUrl ||
            "https://images.alphacoders.com/133/1331511.jpeg"
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
          {currentMovie.logoPath ? (
            <img
              key={currentMovie.id}
              src={`http://localhost:8080/api/movies/${currentMovie.id}/logo`}
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
      <div className="absolute bottom-25 left-17 z-20 flex items-center gap-2">
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
