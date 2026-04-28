import { Play, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, memo } from "react";
import TmdbImage from "./TmbdImage";
import { useMovies } from "../context/MovieContext"; 

const HeroSection = memo(() => {
  const { movies, isLoading } = useMovies();
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  
  useEffect(() => {
    if (movies.length > 0) {
      const shuffled = [...movies].sort(() => 0.5 - Math.random());
      setHeroMovies(shuffled.slice(0, 5));
    }
  }, [movies]);

  
  useEffect(() => {
    if (heroMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? heroMovies.length - 1 : prev - 1));

  if (isLoading) {
    return (
      <div className="w-full h-[75vh] min-h-[500px] bg-neutral-900 animate-pulse flex items-center justify-center">
        <span className="text-neutral-500 font-bold text-xl">Ładowanie premiery...</span>
      </div>
    );
  }

  if (heroMovies.length === 0) return null;

  const currentMovie = heroMovies[currentIndex];

  return (
    <div className="relative px-10 w-full h-[75vh] min-h-[500px] flex items-center">
      
      <div className="absolute inset-0 z-0 bg-black">
        <TmdbImage
          key={`bg-${currentMovie.id}`}
          src={currentMovie.backgroundPath || currentMovie.thumbnailUrl}
          alt={currentMovie.title}
          size="w1280"
          priority={true}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent"></div>
      </div>

      
      <button onClick={prevSlide} className="absolute left-1 z-30 p-2 text-white/40 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-all hover:scale-110">
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button onClick={nextSlide} className="absolute right-1 z-30 p-2 text-white/40 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-all hover:scale-110">
        <ChevronRight className="w-7 h-7" />
      </button>

      
      <div className="relative z-10 px-2 md:px-10 w-full flex flex-col max-w-3xl gap-5">
        <div className="flex flex-col items-start gap-6 leading-tight">
          {currentMovie.logoPath ? (
            <div className="w-full max-w-[250px] md:max-w-[400px] h-[80px] md:h-[120px] flex items-end justify-start mb-4">
              <TmdbImage
                key={`logo-${currentMovie.id}`}
                src={currentMovie.logoPath}
                alt={currentMovie.title}
                size="w500"
                priority={true}
                showBg={false}
                objectFit="object-contain object-left object-bottom"
                className="w-full h-full"
              />
            </div>
          ) : (
            <h1 className="text-4xl md:text-5xl font-cinema text-white leading-tight uppercase">{currentMovie.title}</h1>
          )}

          <div className="w-full">
            <div className="flex items-center gap-3 text-sm text-neutral-300 font-medium mb-3">
              <span className="bg-neutral-800 text-neutral-100 px-2 py-0.5 rounded">12+</span>
              <span>• {currentMovie.categoryName || "Anime • Akcja"}</span>
            </div>
            <p className="text-neutral-300 text-lg leading-relaxed line-clamp-3">
              {currentMovie.description || "Brak opisu w bazie danych."}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <button className="flex items-center gap-2 bg-[#F47521] hover:bg-[#d9661c] text-white px-6 py-3 font-bold rounded transition-colors duration-200">
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </button>
              <button className="flex items-center justify-center border-2 border-[#F47521] text-[#F47521] hover:bg-[#F47521] hover:text-white p-3 rounded transition-colors duration-200">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      
      <div className="absolute px-4 bottom-25 left-17 z-20 flex items-center gap-2">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? "w-8 bg-[#F47521]" : "w-4 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
});

export default HeroSection;