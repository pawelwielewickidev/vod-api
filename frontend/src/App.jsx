import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/ui/Navbar";
import HeroSection from "./components/ui/HeroSection";
import MovieGrid from "./components/ui/MovieGrid";
import MovieDetail from "./components/ui/MovieDetail";
import EpisodeStream from "./components/streaming/EpisodeStream";
import LoginScreen from "./components/auth/LoginScreen";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import WelcomeScreen from "./components/ui/WelcomeScreen";
import RegisterScreen from "./components/auth/RegisterScreen";
import ProfileScreen from "./components/ui/ProfileScreen";

function Home() {
  return (
    <>
      <HeroSection />
      <MovieGrid />
    </>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("vod_token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const showNavbar =
    isLoggedIn && !["/", "/login", "/register"].includes(location.pathname);
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route
          path="/episode/:movieId/:episodeId"
          element={<EpisodeStream />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
