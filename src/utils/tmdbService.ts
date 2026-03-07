const API_KEY = "a2c3ebaa171726bf1ae40d5ff114498b";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  spoken_languages: { english_name: string }[];
  videos?: { results: { key: string; site: string; type: string }[] };
  credits?: {
    cast: { name: string }[];
  };
  release_dates?: {
    results: {
      iso_3166_1: string;
      release_dates: { certification: string }[];
    }[];
  };
}

export const getUpcomingMovies = async (): Promise<TMDBMovie[]> => {
  const response = await fetch(
    `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=sv-SE&region=SE`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch upcoming movies");
  }
  const data = await response.json();
  return data.results;
};

export const getMovieDetails = async (id: string): Promise<TMDBMovieDetails> => {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=sv-SE&append_to_response=videos,credits,release_dates`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  return await response.json();
};

export const getImageUrl = (path: string, size: string = "w500") => {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/${size}${path}`;
};
