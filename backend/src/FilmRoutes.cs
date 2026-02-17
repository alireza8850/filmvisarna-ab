namespace WebApp;

public static class FilmRoutes
{
  public static void start()
  {
    // GET/api/films
    App.MapGet("/api/films", (HttpContext context) =>
    {
      var query = context.Request.Query;
      string search = query.TryGetValue("search", out var s) ? s.ToString() : null;
      string genre = query.TryGetValue("genre", out var g) ? g.ToString() : null;
      string ageLimit = query.TryGetValue("ageLimit", out var a) ? a.ToString() : null;

      var sql = @"
          SELECT id, title, genre, release_year, age_limit, poster_url
          FROM films
          WHERE (@search IS NULL OR title LIKE CONCAT('%', @search, '%'))
          AND (@genre IS NULL OR genre = @genre)
          AND (@ageLimit IS NULL OR age_limit = @ageLimit)
          ORDER BY release_year DESC
      ";

      var films = SQLQuery(sql, new { search, genre, ageLimit }, context);
      return RestResult.Parse(context, films);
    }
    );

    // GET/api/films/{id}
    App.MapGet("/api/films/{id}", (HttpContext context, int id) =>
    {
      var sql = @"
          SELECT id, title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url
          FROM films
          WHERE id = @id
      ";
      var film = SQLQueryOne(sql, new { id }, context);

      if (film == null || film.error != null)
      {
        return RestResult.Parse(context, new { error = "Filmen finns inte." });
      }

      // fetch actors depending on api-contract 
      // GET film's actors 



      // fetch showings depending on api-contract
      // GET/api/films/{id}/showings



      return RestResult.Parse(context, film);


    });

  }
  
  
}