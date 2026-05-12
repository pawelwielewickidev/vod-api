import { Bookmark, ChevronDown, Search, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryDropdown from "./CategoryDropdown";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/profiles") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md text-neutral-400 flex items-center justify-between w-full h-16 px-8 shadow-lg">
      <div className="flex items-center h-full">
        <div className="tracking-widest px-6 md:px-8 cursor-pointer h-full flex items-center">
          <a
            href="/home"
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <img
              src="/public/portfolio_logo.png"
              alt="Portfolio Vod"
              className="h-6 w-auto"
            />
          </a>
        </div>
        <div className="hidden lg:flex items-center h-full text-base text-gray-300  hover:bg-neutral-900 transition-colors">
          <CategoryDropdown />
        </div>
      </div>

      <div className="flex items-center h-full">
        <div className="hidden md:block relative pr-4">
          <Search className="absolute left-3 top-4 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search for anime..."
            className="bg-neutral-900 border border-neutral-700 text-neutral-300 pl-8 px-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-amber-700 transition-colors w-64"
          />
        </div>
        <div className="hidden relative lg:flex items-center justify-center h-full w-16 text-sm text-gray-300  hover:bg-neutral-900 transition-colors">
          <button
            type="button"
            title="My Watchlist"
            onClick={() => navigate("/watchlist")}
            className="h-full w-full pl-5 text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <Bookmark className="w-6 h-6" />
          </button>
        </div>
        <div className="h-full flex items-center hover:bg-neutral-900 transition-colors">
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
}
