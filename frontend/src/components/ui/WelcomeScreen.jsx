import { Link } from "react-router-dom";

export default function WelcomeScreen() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-page-bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/70" />

      {/* Semi-transparent header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-sm border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <img
          src="/portfolio_logo.png"
          alt="Portfolio Vod"
          className="h-8 w-auto"
        />
        <Link
          to="/login"
          className="bg-[#F47521] text-black px-6 py-2 rounded hover:bg-[#d9661c] transition-colors"
        >
          Log In
        </Link>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-start px-8">
        <div className="py-16 px-10 max-w-4xl">
          <h1 className="text-3xl md:text-7xl font-sans font-black text-white mb-6">
            Stream your favorite anime anytime, anywhere.
          </h1>
          <p className="text-neutral-200 text-lg mb-8 leading-relaxed">
            Watch your own collection with our personalized streaming service.
          </p>
          <Link
            to="/register"
            className="bg-[#F47521] text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#d9661c] transition-colors inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
