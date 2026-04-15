import { Bookmark, Search, User } from "lucide-react";
export default function Navbar() {
  return (
    <nav className="bg-neutral-800 text-neutral-400 flex items-center justify-between w-full px-8 py-3">
      <div className="flex items-center gap-8">
        <a
          href="/"
          className="flex items-center gap-3 transition-transform hover:scale-105"
        >
          <img
            src="/public/portfolio_logo.png"
            alt="Portfolio Vod"
            className="h-6 w-auto"
          />
        </a>
        <a
          href="/categories"
          className="hover:text-white transition-colors duration-200"
        >
          <span className="font-cinema font-light">Categories</span>
        </a>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-4 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search for anime..."
            className="bg-neutral-900 border border-neutral-700 text-neutral-300 pl-8 px-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-amber-700 transition-colors w-64"
          />
        </div>
        <button
          title="My Watchlist"
          className="text-neutral-400 hover:text-white transition-colors duration-200"
        >
          <Bookmark className="w-5 h-5 hover:fill-current" />
        </button>
        <button className="bg-[#F47521] text-neutral-200 px-5 py-1.5 rounded-full font-medium hover:bg-[#d9661c] transition-colors duration-200">
          Log in
        </button>
      </div>
    </nav>
  );
}
