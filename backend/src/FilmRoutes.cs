namespace WebApp;

public static class FilmRoutes
{
  public static void Start()
  {
    // GET/api/films
    App.MapGet("/api/films", (HttpContext context) =>
    {
      var query = context.Request.Query;
      string search = query.TryGetValue("search", out var s) ? s.ToString() : null;
      string genre = query.TryGetValue("genre", out var g) ? g.ToString() : null;
      string ageLimit = query.TryGetValue("ageLimit", out var a) ? a.ToString() : null;

      var sql = @"
          SELECT id, title, genre, release_year, age_limit, poster_url, is_featured
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
      var actorsSql = @"
          SELECT a.name
          FROM actors a
          JOIN film_actors fa ON a.id = fa.actor_id
          WHERE fa.film_id = @id
      ";
      var actors = SQLQuery(actorsSql, new { id }, context);
      film.actors = actors.Map(x => x.name);

      // fetch showings depending on api-contract
      // GET/api/films/{id}/showings



      return RestResult.Parse(context, film);


    });

    // POST /api/release-movie
    App.MapPost("/api/release-movie", (HttpContext context, JsonElement bodyJson) =>
    {
      Log($"[DEBUG_LOG] Request to /api/release-movie received from {context.Request.Path}");

      // 0. Clean up any existing duplicates - för debugging - Oskar
      try {
          var duplicates = SQLQuery(@"
              SELECT title FROM films 
              GROUP BY title HAVING COUNT(title) > 1", null, context);
          foreach(var dup in duplicates) {
              string dupTitle = dup.title;
              Log($"[DEBUG_LOG] Found duplicate title: {dupTitle}. Cleaning up...");
              var dupIds = SQLQuery("SELECT id FROM films WHERE title = @dupTitle ORDER BY created_at DESC", new { dupTitle }, context);
              // Keep the newest one, delete others
              for(int i = 1; i < dupIds.Length; i++) {
                  int delId = Convert.ToInt32(dupIds[i].id);
                  Log($"[DEBUG_LOG] Deleting duplicate ID: {delId}");
                  SQLQuery("DELETE FROM tickets WHERE showing_id IN (SELECT id FROM showings WHERE film_id = @delId)", new { delId }, context);
                  SQLQuery("DELETE FROM bookings WHERE showing_id IN (SELECT id FROM showings WHERE film_id = @delId)", new { delId }, context);
                  SQLQuery("DELETE FROM showings WHERE film_id = @delId", new { delId }, context);
                  SQLQuery("DELETE FROM film_actors WHERE film_id = @delId", new { delId }, context);
                  SQLQuery("DELETE FROM films WHERE id = @delId", new { delId }, context);
              }
          }
      } catch (Exception ex) {
          Log("[DEBUG_LOG] Error cleaning duplicates: " + ex.Message);
      }

      // Logic to ensure ACL rule is present in DB
      try
      {
        var existing = SQLQueryOne("SELECT id FROM acl WHERE route = '/api/release-movie' AND method = 'POST'", null, context);
        if (existing == null || existing.id == null)
        {
          Log("[DEBUG_LOG] ACL rule missing for /api/release-movie, attempting to insert...");
          SQLQuery("INSERT IGNORE INTO acl (userRoles, method, allow, route, `match`, comment) VALUES ('visitor,user,staff,admin', 'POST', 'allow', '/api/release-movie', 'true', 'Allow anyone to release a movie')", null, context);
          Log("[DEBUG_LOG] Added missing ACL rule for /api/release-movie");
          // Re-initialize Acl if possible to pick up new rules immediately
          Acl.UnpackRules(SQLQuery("SELECT * FROM acl ORDER BY allow", null, context));
        }
      }
      catch (Exception ex)
      {
        Log("[DEBUG_LOG] Error ensuring ACL rule: " + ex.Message);
      }

      try {
        var body = JSON.Parse(bodyJson.ToString());
        string title = body.title;

        // Check for duplicates by title - I dont know wtf im doing hahahaha
        var existingFilm = SQLQueryOne("SELECT id FROM films WHERE LOWER(TRIM(title)) = LOWER(TRIM(@title))", new { title }, context);
        if (existingFilm != null && existingFilm.id != null)
        {
          Log($"[DEBUG_LOG] Movie '{title}' already exists in database. Skipping insertion.");
          return RestResult.Parse(context, new { success = true, message = "Movie already exists", newFilmId = existingFilm.id });
        }
        
        int duration = body.duration_minutes != null ? (int)body.duration_minutes : 120;
        string genre = body.genre;
        int releaseYear = body.release_year != null ? (int)body.release_year : DateTime.Now.Year;
        int ageLimit = body.age_limit != null ? (int)body.age_limit : 0;
        string description = body.description;
        string language = body.language ?? "Svenska";
        string posterUrl = body.poster_url;
        string trailerUrl = body.trailer_url;
        List<string> actors = new List<string>();
        if (body.actors != null)
        {
          foreach (var actor in (Arr)body.actors)
          {
            actors.Add((string)actor);
          }
        }

        // Identifierar oldest movie (based on created_at or id)
        var oldestFilm = SQLQueryOne("SELECT id FROM films ORDER BY created_at ASC LIMIT 1", null, context);

        if (oldestFilm != null && oldestFilm.id != null)
        {
          int oldestId = Convert.ToInt32(oldestFilm.id);
          // Sequence: tickets -> bookings -> showings -> film_actors -> films
          SQLQuery("DELETE FROM tickets WHERE showing_id IN (SELECT id FROM showings WHERE film_id = @oldestId)", new { oldestId }, context);
          SQLQuery("DELETE FROM bookings WHERE showing_id IN (SELECT id FROM showings WHERE film_id = @oldestId)", new { oldestId }, context);
          SQLQuery("DELETE FROM showings WHERE film_id = @oldestId", new { oldestId }, context);
          SQLQuery("DELETE FROM film_actors WHERE film_id = @oldestId", new { oldestId }, context);
          SQLQuery("DELETE FROM films WHERE id = @oldestId", new { oldestId }, context);
        }

        // Insert the new film (as featured)
        // Set all other films to not featured first
        SQLQuery("UPDATE films SET is_featured = FALSE", null, context);

        var insertFilmSql = @"
          INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url, is_featured)
          VALUES (@title, @duration, @genre, @releaseYear, @ageLimit, @description, @language, @posterUrl, @trailerUrl, TRUE)
        ";
        SQLQuery(insertFilmSql, new { title, duration, genre, releaseYear, ageLimit, description, language, posterUrl, trailerUrl }, context);

        var newFilm = SQLQueryOne("SELECT MAX(id) as id FROM films", null, context);
        if (newFilm == null || newFilm.id == null) {
            throw new Exception("Could not find newly inserted film.");
        }
        int newFilmId = Convert.ToInt32(newFilm.id);

        // Add actors
        foreach (var actorName in actors)
        {
          var actor = SQLQueryOne("SELECT id FROM actors WHERE name = @actorName", new { actorName }, context);
          int actorId;
          if (actor == null || actor.id == null)
          {
            SQLQuery("INSERT INTO actors (name) VALUES (@actorName)", new { actorName }, context);
            var actorIdRes = SQLQueryOne("SELECT MAX(id) as id FROM actors", null, context);
            actorId = Convert.ToInt32(actorIdRes.id);
          }
          else
          {
            actorId = Convert.ToInt32(actor.id);
          }
          SQLQuery("INSERT INTO film_actors (film_id, actor_id) VALUES (@newFilmId, @actorId)", new { newFilmId, actorId }, context);
        }

        // Generate automatic showtimes 
        for (int i = 0; i < 7; i++)
        {
          var date = DateTime.Now.AddDays(i).ToString("yyyy-MM-dd");
          // Hall 1
          SQLQuery("INSERT INTO showings (film_id, hall_id, start_time) VALUES (@newFilmId, 1, @time)", 
            new { newFilmId, time = $"{date} 18:00:00" }, context);
          SQLQuery("INSERT INTO showings (film_id, hall_id, start_time) VALUES (@newFilmId, 1, @time)", 
            new { newFilmId, time = $"{date} 21:00:00" }, context);
          // Hall 2
          SQLQuery("INSERT INTO showings (film_id, hall_id, start_time) VALUES (@newFilmId, 2, @time)", 
            new { newFilmId, time = $"{date} 19:30:00" }, context);
        }

        return RestResult.Parse(context, new { success = true, newFilmId });
      } catch (Exception ex) {
        Log("[DEBUG_LOG] Error in /api/release-movie: " + ex.ToString());
        return RestResult.Parse(context, new { error = "Internal server error: " + ex.Message });
      }
    });

  }
  
  
}