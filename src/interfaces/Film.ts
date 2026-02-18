export default interface film{
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
  created_at: Date;
}

