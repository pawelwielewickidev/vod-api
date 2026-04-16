import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MovieGrid from "./components/MovieGrid";
import MovieDetail from "./components/MovieDetail";

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
