export default function MovieGrid() {
  const [movies, setMovies] = useState([]);
  const [movieByCategory, setMovieByCategory] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/movies");
  });
}
