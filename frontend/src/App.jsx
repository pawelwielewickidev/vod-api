import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MovieGrid from "./components/MovieGrid";
import MovieDetail from "./components/MovieDetail";
import EpisodeStream from "./components/EpisodeStream";

function Home() {
  return (
    <>
      <HeroSection />
      <MovieGrid />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/episode/:movieId/:episodeId" element={<EpisodeStream />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
