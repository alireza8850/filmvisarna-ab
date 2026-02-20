namespace WebApp;

public static class FilmvisarnaTables
{
  // Create tables

  public static void CreateTablesIfNotExist(MySqlConnection db)
  {
    var createTablesSql = @"

            -- films
            CREATE TABLE IF NOT EXISTS films (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                title VARCHAR(255) NOT NULL, 
                duration_minutes INT NOT NULL, 
                genre VARCHAR(100), 
                release_year INT NOT NULL,  
                age_limit INT, 
                description TEXT, 
                language VARCHAR(100), 
                poster_url VARCHAR(500), 
                trailer_url VARCHAR(500), 
                is_featured BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP() NOT NULL
            );


            -- halls


            -- seats


            -- showings


            -- ticket_types


            -- ticket_prices

            -- bookings


            -- tickets

            -- actors

            -- film_actors




        ";

    // Execute each statement separately
    foreach (var sql in createTablesSql.Split(';'))
    {
      var trimmed = sql.Trim();
      if (!string.IsNullOrEmpty(trimmed))
      {
        var command = db.CreateCommand();
        command.CommandText = trimmed;
        command.ExecuteNonQuery();
      }
    }
  }

  // seed data 
  public static void SeedFilmvisarnaData(MySqlConnection db)
  {

    // Check if tables are empty and seed if needed
    var command = db.CreateCommand();
    // mark Avatar 3 as featured
    command.CommandText = "UPDATE films SET is_featured = TRUE WHERE id = 1";

    command.ExecuteNonQuery();

    // Seed films
    command.CommandText = "SELECT COUNT(*) FROM films";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var filmsData = new List<string>
            {
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Avatar 3', 192, 'Science fiction', 2025, 12,'Den tredje delen i Avatar-sagan där konflikten på Pandora når nya nivåer och nya allianser formas.','Svenska', 'avatar3.jpg', 'avatar3_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Mercy', 105, 'Thriller', 2023, 15,'En före detta soldat tvingas rädda sin familj i en desperat kamp mot klockan.','Svenska', 'mercy.jpg', 'mercy_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('SvampBob Fyrkant – Filmen', 95, 'Animerat', 2023, 7,'SvampBob ger sig ut på ett nytt galet undervattensäventyr tillsammans med sina vänner.','Svenska', 'spongebob.jpg', 'spongebob_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Greenland 2', 120, 'Action', 2024, 11,'Efter en global katastrof ställs mänskligheten inför ett nytt hot mot sin överlevnad.','Svenska', 'greenland2.jpg', 'greenland2_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url)  VALUES
                ('Send Help', 100, 'Skräck', 2024, 16,'Två överlevande kämpar för att hålla sig vid liv efter en brutal flygolycka.','Svenska', 'sendhelp.jpg', 'sendhelp_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('28 Years Later', 130, 'Skräck', 2025, 18,'Årtionden efter virusutbrottet återvänder skräcken i en ännu brutalare värld.','Svenska', '28yearslater.jpg', '28yearslater_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Die My Love', 110, 'Drama', 2024, 15,'Ett intensivt psykologiskt drama om kärlek, besatthet och sammanbrott.','Svenska', 'diemylove.jpg', 'diemylove_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Eagles of the Republic', 125, 'Drama', 2023, 13,'En politisk thriller om makt, lojalitet och identitet i en skakig nation.','Svenska', 'eagles.jpg', 'eagles_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('No Other Choice', 118, 'Kriminal', 2023, 15,'En man pressas till det yttersta när han tvingas fatta omöjliga beslut.','Svenska', 'nootherchoice.jpg', 'nootherchoice_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Nuremberg', 135, 'Historiskt', 2023, 13,'En dramatisk skildring av rättegångarna mot nazistiska krigsförbrytare efter andra världskriget.','Svenska', 'nuremberg.jpg', 'nuremberg_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Dune: Del två', 165, 'Science fiction', 2024, 12,'Paul Atreides förenar Fremenfolket och tar kampen om planeten Arrakis.','Svenska', 'dune2.jpg', 'dune2_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Oppenheimer', 180, 'Biografi', 2023, 15,'Historien om J. Robert Oppenheimer och skapandet av atombomben.','Svenska', 'oppenheimer.jpg', 'oppenheimer_trailer.mp4')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('The Batman', 176, 'Action', 2022, 13,'Batman utreder en serie mörka brott som hotar hela Gotham City.','Svenska', 'batman.jpg', 'batman_trailer.mp4')"
            };
      foreach (var sql in filmsData)
      {
        command.CommandText = sql;
        command.ExecuteNonQuery();
      }
    }
  }

}
