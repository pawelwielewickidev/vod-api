import { useQuery } from '@tanstack/react-query';
import MovieRow from "./MovieRow";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MovieGrid() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const token = localStorage.getItem("vod_token");
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Błąd ładowania kategorii");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#F47521] text-xl font-bold animate-pulse">Wczytywanie biblioteki...</div>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-400 py-20">{error.message}</div>;
  if (!categories || categories.length === 0) return <div className="text-center text-neutral-500 py-20">Brak kategorii w bazie.</div>;

  return (
    <div className="px-8 md:px-16 py-12 w-full max-w-[1800px] mx-auto">
      {categories.map((category) => (
        <MovieRow
          key={category.id}
          categoryId={category.id}
          categoryName={category.name} 
        />
      ))}
    </div>
  );
}
