export default interface Film{
  id: number;
  title: string;
  duration_minutes: number;
  genre: string;
  release_year: number;
  age_limit: number;
  description: string;
  language: string;
  poster_url: string;
  trailer_url: string;
  is_featured: boolean;
  created_at: Date;
  actors?: string[];
}

