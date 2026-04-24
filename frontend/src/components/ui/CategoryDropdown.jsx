import React from "react";
import { Link } from "react-router-dom";

const CategoryDropdown = () => {
  const genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Music",
    "Romance",
    "Sci-Fi",
    "Seinen",
    "Shojo",
    "Shonen",
    "Slice of life",
    "Sports",
    "Supernatural",
    "Thriller",
  ];

  return (
    <div className="relative group h-full">
      <button className="h-full flex items-center gap-1 px-4 text-neutral-400 hover:text-white py-2 font-cinema text-ml transition-colors">
        Categories
        <svg
          className="w-4 h-4 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      <div className="absolute top-full left-0 w-[650px] bg-[#0a0a0a]/95 border border-neutral-800 rounded-b-md shadow-2xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 flex">
        <div className="w-1/3 p-6 flex flex-col gap-5 border-r border-orange-500">
          <Link
            to="/browse"
            className="text-neutral-400 hover:text-white text-sm font-medium transition-colors"
          >
            Browse All (A-Z)
          </Link>
        </div>

        <div className="w-2/3 p-6">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
            Genres
          </h3>

          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
            {genres.map((genre) => (
              <Link
                key={genre}
                to={`/category/${genre.toLowerCase()}`}
                className="text-neutral-400 hover:text-white text-sm transition-colors"
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown;
