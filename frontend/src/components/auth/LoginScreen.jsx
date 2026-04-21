import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Nowy stan na komunikaty o błędach
  const [isLoading, setIsLoading] = useState(false); // Stan ładowania, żeby wyłączyć przycisk

  const navigate = useNavigate(); // Do przekierowania po zalogowaniu

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Uderzamy do Twojego Spring Boota
      const response = await fetch(
        "http://localhost:8080/api/auth/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      // 2. Sprawdzamy, czy odpowiedź to "200 OK"
      if (response.ok) {
        const data = await response.json();

        // 3. Zapisujemy token JWT do pamięci przeglądarki!
        localStorage.setItem("vod_token", data.token);

        console.log("Zalogowano pomyślnie! Token zachowany.");

        // 4. Przekierowujemy użytkownika na stronę główną
        navigate("/home");
      } else {
        // Jeśli Spring rzuci 403 Forbidden lub 401 Unauthorized
        setError("Nieprawidłowy e-mail lub hasło.");
      }
    } catch (err) {
      console.error("Błąd sieci:", err);
      setError("Błąd połączenia z serwerem. Spróbuj ponownie później.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141519] flex flex-col justify-center items-center relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#141519] via-[#141519]/80 to-transparent z-0"></div>
      <div
        className="absolute inset-0 opacity-20 z-0"
        style={{
          backgroundImage: 'url("/login-screen-bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-amber-900">
        <header className="relative z-10 bg-black px-8 py-4 flex items-center justify-between">
          <a href="/">
            <img
              src="/portfolio_logo.png"
              alt="Portfolio Vod"
              className="h-8 w-auto"
            />
          </a>
        </header>
      </div>

      <div className=" border-amber-800 bg-black bg-gradient-to-b from-black via-black/50 to-amber-800/60 p-10 rounded-1xl shadow-2xl z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            VOD PORTFOLIO
          </h1>
          <p className="text-gray-400">Zaloguj się, aby kontynuować seans</p>
        </div>

        {/* Wyświetlanie błędu, jeśli jakiś wystąpił */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Adres E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#141519] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              placeholder="jan@kowalski.pl"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Hasło
              </label>
              <a
                href="#"
                className="text-xs text-orange-500 hover:text-orange-400"
              >
                Zapomniałeś hasła?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#141519] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 disabled:text-gray-400 text-white font-bold py-3 rounded-lg mt-2 transition-colors duration-200"
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Nie masz jeszcze konta?{" "}
          <Link
            to="/register"
            className="text-orange-500 hover:text-white transition-colors font-medium"
          >
            Zarejestruj się
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
