import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
export default function MovieGrid() {
  const [movieByCategory, setMovieByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/movies")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const grouped = data.reduce((acc, movie) => {
            const categoryName = movie.categoryName || "Inne";

            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }

            acc[categoryName].push(movie);

            return acc;
          }, {});
          setMovieByCategory(grouped);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Connect with backend failed", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#F47521] text-xl font-bold animate-pulse">
          Ładowanie biblioteki...
        </div>
      </div>
    );
  }

  if (Object.keys(movieByCategory).length === 0) {
    return (
      <div className="text-center text-neutral-500 py-20">
        Brak filmów w bazie danych. Dodaj coś w Postmanie!
      </div>
    );
  }

  return (
    <div className="px-8 md:px-16 py-12 w-full max-w-[1800px] mx-auto">
      {Object.entries(movieByCategory).map(([categoryName, movies]) => (
        <div key={categoryName} className="mb-14">
          <h3 className="text-2xl md:text-3xl font-cinema text-white mb-6 border-l-4 border-[#F47521] pl-4 tracking-wide">
            {categoryName}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie) => (
              <Link to={`/movie/${movie.id}`} key={movie.id}>
                <div
                  key={movie.id}
                  className="bg-zinc-900 rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-[#F47521] group relative shadow-lg"
                >
                  <img
                    src={
                      `http://localhost:8080/api/movies/${movie.id}/poster` ||
                      "https://placehold.co/400x600/1f1f1f/404040?text=Brak+Okładki"
                    }
                    alt={movie.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h4 className="text-white font-bold text-sm md:text-base line-clamp-2">
                      {movie.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
