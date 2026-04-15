import { Play, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
export default function HeroSection() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/movies")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          setMovies(data.slice(3, 5));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load Hero from backend:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (movies.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? movies.length - 1 : prevIndex - 1,
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] min-h-[500px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <span className="text-neutral-500 font-bold text-xl">
          Ładowanie premiery...
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
            currentMovie.backgroundUrl ||
            currentMovie.posterUrl ||
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

      <div className="relative z-10 px-8 md:px-16 w-full max-w-3xl flex flex-col gap-5">
        <h1 className="text-5xl md:text-7xl font-cinema text-white leading-tight">
          {currentMovie.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-neutral-300 font-medium">
          <span className="bg-neutral-800 text-neutral-100 px-2 py-0.5 rounded">
            12+
          </span>
          <span>• {currentMovie.categoryName || "Anime • Akcja"}</span>
        </div>

        <p className="text-neutral-300 text-lg leading-relaxed line-clamp-3">
          {currentMovie.description ||
            "Brak opisu w bazie danych. Uzupełnij opis w panelu Spring Boot!"}
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
