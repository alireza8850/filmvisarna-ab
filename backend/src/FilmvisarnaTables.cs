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
            CREATE TABLE IF NOT EXISTS halls (
                id INT AUTO_INCREMENT PRIMARY KEY,
                hall_name VARCHAR(255) NOT NULL,
                total_rows INT NOT NULL,
                seats_per_row INT NOT NULL,
                hall_description TEXT NOT NULL,
                halls_image VARCHAR(255) NOT NULL,
                audio_name VARCHAR(255) NOT NULL,
                audio_description TEXT NOT NULL,
                audio_image VARCHAR(255) NOT NULL,
                food_name VARCHAR(255) NOT NULL,
                food_description TEXT NOT NULL,
                glasses_name VARCHAR(255) NOT NULL,
                glasses_description TEXT NOT NULL
               );

            -- seats
            CREATE TABLE IF NOT EXISTS seats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                row_index INT NOT NULL,
                seat_letter CHAR(1) NOT NULL,
                hall_id INT NOT NULL,
                FOREIGN KEY (hall_id) REFERENCES halls(id),
                UNIQUE (hall_id, row_index, seat_letter)
            );

            -- showings
            CREATE TABLE IF NOT EXISTS showings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                film_id INT NOT NULL,
                hall_id INT NOT NULL,
                start_time DATETIME NOT NULL,
                FOREIGN KEY (film_id) REFERENCES films(id),
                FOREIGN KEY (hall_id) REFERENCES halls(id)
            );

            -- ticket_types
            CREATE TABLE IF NOT EXISTS ticket_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_type ENUM('adult','child','senior') NOT NULL
            );

            -- ticket_prices
            CREATE TABLE IF NOT EXISTS ticket_prices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticket_type_id INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                valid_from DATE NOT NULL,
                valid_to DATE NOT NULL,
                FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id)
            );

            -- bookings
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_number VARCHAR(50) NOT NULL UNIQUE,
                user_id INT,
                showing_id INT NOT NULL,
                booking_status ENUM('reserved','confirmed','cancelled','expired') DEFAULT 'reserved',
                total_price DECIMAL(10,2),
                booking_email VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (showing_id) REFERENCES showings(id)
            );

            -- tickets
            CREATE TABLE IF NOT EXISTS tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                showing_id INT NOT NULL,
                seat_id INT,
                ticket_type_id INT NOT NULL,
                FOREIGN KEY (booking_id) REFERENCES bookings(id),
                FOREIGN KEY (showing_id) REFERENCES showings(id),
                FOREIGN KEY (seat_id) REFERENCES seats(id),
                FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),
                UNIQUE(showing_id, seat_id)
            );

            -- actors
            CREATE TABLE IF NOT EXISTS actors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255)
            );

            -- film_actors
            CREATE TABLE IF NOT EXISTS film_actors (
                film_id INT,
                actor_id INT,
                PRIMARY KEY(film_id, actor_id),
                FOREIGN KEY (film_id) REFERENCES films(id),
                FOREIGN KEY (actor_id) REFERENCES actors(id)
            );




        ";

    // Execute each statement separately with error handling (because I am sick and tired of bugs)
    foreach (var sql in createTablesSql.Split(';'))
    {
      var trimmed = sql.Trim();
      if (!string.IsNullOrEmpty(trimmed))
      {
        try
        {
          var command = db.CreateCommand();
          command.CommandText = trimmed;
          command.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
          Console.WriteLine($"Error creating table: {ex.Message}");
          Console.WriteLine($"SQL: {trimmed.Substring(0, Math.Min(100, trimmed.Length))}...");
          throw;
        }
      }
    }
  }

  // seed data
  public static void SeedFilmvisarnaData(MySqlConnection db)
  {
    var command = db.CreateCommand();

    try
    {
      // Seed halls
      command.CommandText = "SELECT COUNT(*) FROM halls";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO halls 
                           (id, hall_name, total_rows, seats_per_row, 
                           hall_description, halls_image,
                           audio_name, audio_description, audio_image,
                           food_name, food_description,
                           glasses_name, glasses_description) 
                          VALUES(
                            1, 'Stora salongen', 10, 10,
                            'Med en enorm sal får du en oförglömlig upplevelse! Med hela 100 mjuka stolar så kan vi garantera att du sjunker in i den optimala bio upplevelsen.',
                            'stora_salongen.jpg',
                            'Dolby Atmos',
                            'Dolby Atmos är det bästa ljudsystemet i världen. Med en innovativt designad 3D-system så känns det som att man faktiskt är i filmen. Ljudnivån når 105 dB och vibrationerna känns i benen.',
                            'dolby_atmos.jpg',
                            'Popcorn & Dryck',
                            'Njut av färskt popcorn och ett brett urval av drycker under föreställningen.',
                            '3D-glasögon',
                            'Högkvalitativa 3D-glasögon ingår för utvalda föreställningar.'
                            ),
                          (
                             2, 'Lilla salongen', 8, 8,
                             'En liten men ödmjuk salong. Det man tappar i storlek får man tillbaka i intensitet. Skräckfilmer har aldrig varit så läskiga och actionfilmer kan få en att rysa till.',
                             'lilla_salongen.jpg',
                             'AWP Onetap Sound System',
                             'Designad år 2011 men ikonisk även nu. Ett ljudsystem som är beundrat av regissörer och ger det förväntade ljudet vid produktion.',
                             'awp_sound.jpg',
                             'Godis & Snacks',
                             'Ett urval av godis, chips och läsk finns tillgängligt i foajén.',
                             'Standardglasögon',
                             'Bekväma standardglasögon för en tydlig upplevelse.'
                              )
                              
                              ";
        command.ExecuteNonQuery();

      }

      // Seed seats - Stora salongen
      command.CommandText = "SELECT COUNT(*) FROM seats WHERE hall_id = 1";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO seats (row_index, seat_letter, hall_id)
                SELECT
                    r.row_index,
                    CHAR(65 + s.seat_letter) AS seat_letter,
                    1 AS hall_id
                FROM
                    (SELECT 0 row_index UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                     UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7) r
                CROSS JOIN
                    (SELECT 0 seat_letter UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                     UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
                     UNION ALL SELECT 8 UNION ALL SELECT 9) s
                     
                     ";
        command.ExecuteNonQuery();
      }

      // Seed seats - Lilla salongen
      command.CommandText = "SELECT COUNT(*) FROM seats WHERE hall_id = 2";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO seats (row_index, seat_letter, hall_id)
                SELECT
                    r.row_index,
                    CHAR(65 + s.seat_letter) AS seat_letter,
                    2 AS hall_id
                FROM
                    (SELECT 0 row_index UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                     UNION ALL SELECT 4 UNION ALL SELECT 5) r
                CROSS JOIN
                    (SELECT 0 seat_letter UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                     UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
                     UNION ALL SELECT 8 UNION ALL SELECT 9) s
                     
                     ";
        command.ExecuteNonQuery();
      }

      // Seed films
      command.CommandText = "SELECT COUNT(*) FROM films";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        var filmsData = new List<string>
            {
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Avatar 3', 192, 'Science fiction', 2025, 12,'Den tredje delen i Avatar-sagan där konflikten på Pandora når nya nivåer och nya allianser formas.','Svenska', 'avatar3.jpg', 'https://www.youtube.com/watch?v=nb_fFj_0rq8&pp=ygUHYXZhdGFyMw%3D%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Mercy', 105, 'Thriller', 2023, 15,'En före detta soldat tvingas rädda sin familj i en desperat kamp mot klockan.','Svenska', 'mercy.jpg', 'https://www.youtube.com/watch?v=7H7Djx17l8Y&pp=ygUFbWVyY3k%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('SvampBob Fyrkant', 95, 'Animerat', 2023, 7,'SvampBob ger sig ut på ett nytt galet undervattensäventyr tillsammans med sina vänner.','Svenska', 'spongebob.jpg', 'https://www.youtube.com/watch?v=XdPt8QWTypI&pp=ygUTc3BvbmdlYm9iMjAyMyBtb3ZpZQ%3D%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Greenland 2', 120, 'Action', 2024, 11,'Efter en global katastrof ställs mänskligheten inför ett nytt hot mot sin överlevnad.','Svenska', 'greenland2.jpg', 'https://www.youtube.com/watch?v=hiD3zk0ZRFg&pp=ygUQZ3JlZW5sYW5nMiBtb3ZpZQ%3D%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url)  VALUES
                ('Send Help', 100, 'Skräck', 2024, 16,'Två överlevande kämpar för att hålla sig vid liv efter en brutal flygolycka.','Svenska', 'sendhelp.jpg', 'https://www.youtube.com/watch?v=R4wiXj9NmEE&pp=ygUPc2VuZCBoZWxwIG1vdmll')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('28 Years Later', 130, 'Skräck', 2025, 18,'Årtionden efter virusutbrottet återvänder skräcken i en ännu brutalare värld.','Svenska', '28yearslater.jpg', 'https://www.youtube.com/watch?v=mcvLKldPM08&pp=ygUSMjh5ZWFyc2xhdGVyIG1vdmll')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Die My Love', 110, 'Drama', 2024, 15,'Ett intensivt psykologiskt drama om kärlek, besatthet och sammanbrott.','Svenska', 'diemylove.jpg', 'https://www.youtube.com/watch?v=ol822Dp0ngQ&pp=ygURZGllIG15IGxvdmUgbW92aWU%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Eagles of the Republic', 125, 'Drama', 2023, 13,'En politisk thriller om makt, lojalitet och identitet i en skakig nation.','Svenska', 'eagles.jpg', 'https://www.youtube.com/watch?v=U0KKCGsqs8I&pp=ygUMZWFnbGVzIG1vdmll')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('No Other Choice', 118, 'Kriminal', 2023, 15,'En man pressas till det yttersta när han tvingas fatta omöjliga beslut.','Svenska', 'nootherchoice.jpg', 'https://www.youtube.com/watch?v=HKZpuG_ezvY&pp=ygUVbm8gb3RoZXIgY2hvaWNlIG1vdmll')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Nuremberg', 135, 'Historiskt', 2023, 13,'En dramatisk skildring av rättegångarna mot nazistiska krigsförbrytare efter andra världskriget.','Svenska', 'nuremberg.jpg', 'https://www.youtube.com/watch?v=WvAy9C-bipY&pp=ygUPbnVyZW1iZXJnIG1vdmll')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Dune: Del två', 165, 'Science fiction', 2024, 12,'Paul Atreides förenar Fremenfolket och tar kampen om planeten Arrakis.','Svenska', 'dune2.jpg', 'https://www.youtube.com/watch?v=BEO2D_hhXDs&pp=ygULZHVuZTIgbW92aWXSBwkJogoBhyohjO8%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Oppenheimer', 180, 'Biografi', 2023, 15,'Historien om J. Robert Oppenheimer och skapandet av atombomben.','Svenska', 'oppenheimer.jpg', 'https://www.youtube.com/watch?v=bK6ldnjE3Y0&pp=ygURb3BwZW5oZWltZXIgbW92aWU%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('The Batman', 176, 'Action', 2022, 13,'Batman utreder en serie mörka brott som hotar hela Gotham City.','Svenska', 'batman.jpg', 'https://www.youtube.com/watch?v=mqqft2x_Aa4&pp=ygUQdGhlIGJhdG1hbiBtb3ZpZQ%3D%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Bamse och havets hemlighet', 66, 'Barn, Animerat, Familj', 2025, 19,'Bamse och havets hemlighet är en film som handlar om att vara utanför, inte ha en kompis och om den underbara lyckan i att äntligen hitta någon som förstår en. Det är en storslagen historia som tar Bamse, Lille Skutt och Skalman bort från Småköping, ut på öppet vatten, till andra sidan jordklotet och långt ner på havets botten. Sist men inte minst är det en berättelse om kapten Buster som är beredd att göra vad som helst för att få tillbaka titeln Havets fasa. Precis vad som helst. Ingenting kan stoppa honom från att försöka vara tuffast på havet. Inte ens världens största sjöodjur.','Svenska', 'bamse.jpg', 'https://www.youtube.com/watch?v=exPw1q2n6q8&pp=ygUgQmFtc2Ugb2NoIGhhdmV0cyBoZW1saWdoZXQgbW92aWXSBwkJogoBhyohjO8%3D')",
                @"INSERT INTO films (title, duration_minutes, genre, release_year, age_limit, description, language, poster_url, trailer_url) VALUES
                ('Lek med Alfons Åberg', 37, 'Barn, Animerat, Familj', 2026, 16,'Ett nytt lekfullt Bok-Filmspaket med Alfons Åberg. Det handlar om det alldeles underbara när pappa äntligen lägger vardagssysslorna åt sidan och följer med Alfons in i fantasins värld, om att leka osynligt med Viktor men också om det hemska i att bli oskyldigt anklagad för att vara tjuv. Vi får möta Alfons i Osynligt med Alfons, Där går TJUV-Alfons! och Flyg! Sa Alfons Åberg','Svenska', 'lek.jpg', 'https://www.youtube.com/watch?v=wWB5XP-abuI&pp=ygUbTGVrIG1lZCBBbGZvbnMgw4ViZXJnIG1vdmll')"

            };
        foreach (var sql in filmsData)
        {
          command.CommandText = sql;
          command.ExecuteNonQuery();
        }
      }

      // Mark Avatar 3 as featured
      command.CommandText = "UPDATE films SET is_featured = TRUE WHERE id = 1";
      command.ExecuteNonQuery();

      // Seed showings
      command.CommandText = "SELECT COUNT(*) FROM showings";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO showings (film_id, hall_id, start_time) VALUES
                -- Avatar 3 (film 1)
                (1, 1, CONCAT(CURDATE(), ' 10:00:00')),
                (1, 1, CONCAT(CURDATE(), ' 13:30:00')),
                (1, 1, CONCAT(CURDATE(), ' 17:00:00')),
                (1, 1, CONCAT(CURDATE(), ' 20:30:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:00:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:30:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:00:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 21:30:00')),
                (1, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 10:30:00')),
                (1, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 19:00:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 13:00:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 18:30:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 14:00:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 15:30:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 17:00:00')),
                (1, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 20:30:00')),

                -- Mercy (film 2)
                (2, 2, CONCAT(CURDATE(), ' 12:00:00')),
                (2, 2, CONCAT(CURDATE(), ' 16:30:00')),
                (2, 2, CONCAT(CURDATE(), ' 20:00:00')),
                (2, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 13:00:00')),
                (2, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')),
                (2, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 15:00:00')),
                (2, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 21:00:00')),
                (2, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 14:00:00')),
                (2, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 18:30:00')),

                -- SvampBob Fyrkant (film 3)
                (3, 2, CONCAT(CURDATE(), ' 10:00:00')),
                (3, 2, CONCAT(CURDATE(), ' 13:00:00')),
                (3, 2, CONCAT(CURDATE(), ' 15:30:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 13:30:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 11:00:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 14:00:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 10:00:00')),
                (3, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 13:00:00')),

                -- Greenland 2 (film 4)
                (4, 1, CONCAT(CURDATE(), ' 11:30:00')),
                (4, 1, CONCAT(CURDATE(), ' 15:00:00')),
                (4, 1, CONCAT(CURDATE(), ' 18:30:00')),
                (4, 1, CONCAT(CURDATE(), ' 22:00:00')),
                (4, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:00:00')),
                (4, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:30:00')),
                (4, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 13:30:00')),
                (4, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 20:00:00')),
                (4, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 15:00:00')),
                (4, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 21:00:00')),

                -- Send Help (film 5)
                (5, 2, CONCAT(CURDATE(), ' 14:00:00')),
                (5, 2, CONCAT(CURDATE(), ' 18:00:00')),
                (5, 2, CONCAT(CURDATE(), ' 21:30:00')),
                (5, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00')),
                (5, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 20:00:00')),
                (5, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:30:00')),
                (5, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 22:00:00')),

                -- 28 Years Later (film 6)
                (6, 1, CONCAT(CURDATE(), ' 16:00:00')),
                (6, 1, CONCAT(CURDATE(), ' 19:30:00')),
                (6, 1, CONCAT(CURDATE(), ' 22:30:00')),
                (6, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:30:00')),
                (6, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 20:30:00')),
                (6, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),
                (6, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 20:30:00')),

                -- Die My Love (film 7)
                (7, 2, CONCAT(CURDATE(), ' 11:00:00')),
                (7, 2, CONCAT(CURDATE(), ' 15:00:00')),
                (7, 2, CONCAT(CURDATE(), ' 19:00:00')),
                (7, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
                (7, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:00:00')),
                (7, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 12:00:00')),
                (7, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 18:00:00')),

                -- Eagles of the Republic (film 8)
                (8, 1, CONCAT(CURDATE(), ' 12:30:00')),
                (8, 1, CONCAT(CURDATE(), ' 16:30:00')),
                (8, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:00:00')),
                (8, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00')),
                (8, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:30:00')),
                (8, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 11:30:00')),
                (8, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 15:30:00')),

                -- No Other Choice (film 9)
                (9, 2, CONCAT(CURDATE(), ' 13:30:00')),
                (9, 2, CONCAT(CURDATE(), ' 17:30:00')),
                (9, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 12:30:00')),
                (9, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:30:00')),
                (9, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 13:00:00')),
                (9, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 19:30:00')),

                -- Nuremberg (film 10)
                (10, 1, CONCAT(CURDATE(), ' 14:30:00')),
                (10, 1, CONCAT(CURDATE(), ' 19:00:00')),
                (10, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:30:00')),
                (10, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:30:00')),
                (10, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 14:00:00')),
                (10, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 19:30:00')),

                -- Dune: Del två (film 11)
                (11, 1, CONCAT(CURDATE(), ' 10:30:00')),
                (11, 1, CONCAT(CURDATE(), ' 14:30:00')),
                (11, 1, CONCAT(CURDATE(), ' 18:30:00')),
                (11, 1, CONCAT(CURDATE(), ' 22:00:00')),
                (11, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:00:00')),
                (11, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:00:00')),
                (11, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 19:30:00')),
                (11, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 12:30:00')),
                (11, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 18:30:00')),
                (11, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 15:00:00')),
                (11, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 20:00:00')),

                -- Oppenheimer (film 12)
                (12, 1, CONCAT(CURDATE(), ' 13:00:00')),
                (12, 1, CONCAT(CURDATE(), ' 17:30:00')),
                (12, 1, CONCAT(CURDATE(), ' 21:30:00')),
                (12, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:00:00')),
                (12, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 15:30:00')),
                (12, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 20:00:00')),
                (12, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 10:00:00')),
                (12, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00')),

                -- The Batman (film 13)
                (13, 1, CONCAT(CURDATE(), ' 11:00:00')),
                (13, 1, CONCAT(CURDATE(), ' 15:30:00')),
                (13, 1, CONCAT(CURDATE(), ' 20:00:00')),
                (13, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:30:00')),
                (13, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:30:00')),
                (13, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 18:30:00')),
                (13, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 22:00:00')),
                (13, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 11:00:00')),
                (13, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 17:00:00')),

                -- Bamse och havets hemlighet (film 14)
                (14, 2, CONCAT(CURDATE(), ' 09:30:00')),
                (14, 2, CONCAT(CURDATE(), ' 12:30:00')),
                (14, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 10:00:00')),
                (14, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 09:00:00')),
                (14, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 10:00:00')),
                (14, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 11:30:00')),
                (14, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 09:30:00')),
                (14, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 12:00:00')),
                (14, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 10:30:00')),

                -- Lek med Alfons Åberg (film 15)
                (15, 2, CONCAT(CURDATE(), ' 10:30:00')),
                (15, 2, CONCAT(CURDATE(), ' 13:30:00')),
                (15, 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:00:00')),
                (15, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 10:00:00')),
                (15, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 11:30:00')),
                (15, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 4 DAY), ' 09:00:00')),
                (15, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 5 DAY), ' 11:00:00')),
                (15, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 6 DAY), ' 10:00:00')),
                (15, 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), ' 13:00:00'))";
        command.ExecuteNonQuery();
      }

      // Seed ticket types
      command.CommandText = "SELECT COUNT(*) FROM ticket_types";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO ticket_types (ticket_type) VALUES
                ('adult'),
                ('child'),
                ('senior')";
        command.ExecuteNonQuery();
      }

      // Seed ticket prices
      command.CommandText = "SELECT COUNT(*) FROM ticket_prices";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO ticket_prices (ticket_type_id, price, valid_from, valid_to) VALUES
                (1, 140.00, '2025-01-01', '2026-12-31'),
                (2, 80.00, '2025-01-01', '2026-12-31'),
                (3, 120.00, '2025-01-01', '2026-12-31')";
        command.ExecuteNonQuery();
      }

      // Seed bookings
      command.CommandText = "SELECT COUNT(*) FROM bookings";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO bookings (booking_number, user_id, showing_id, booking_status, total_price, booking_email, expires_at) VALUES
                ('A7B2X9', 2, 1, 'confirmed', 320.00, 'neha@unesco.org', NULL),
                ('B9B2X9', null, 2, 'confirmed', 320.00, 'arbaz@gmail.com', '2026-03-21 22:00:00'),
                ('R5K8M1', 5, 3, 'reserved', 160.00, 'ali@google.com', '2026-03-01 15:45:00')";
        command.ExecuteNonQuery();
      }

      // Seed tickets
      command.CommandText = "SELECT COUNT(*) FROM tickets";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
                SELECT 1, 1, id, 1 FROM seats WHERE hall_id = 1 AND row_index = 1 AND seat_letter = 'J'";
        command.ExecuteNonQuery();

        command.CommandText = @"INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
                SELECT 1, 1, id, 1 FROM seats WHERE hall_id = 1 AND row_index = 1 AND seat_letter = 'I'";
        command.ExecuteNonQuery();

        command.CommandText = @"INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
                SELECT 2, 3, id, 2 FROM seats WHERE hall_id = 2 AND row_index = 3 AND seat_letter = 'C'";
        command.ExecuteNonQuery();
      }

      // Seed actors
      command.CommandText = "SELECT COUNT(*) FROM actors";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO actors (name) VALUES
                ('Oskar Gyllenör'),
                ('Zoe Saldaña'),
                ('Jason Clarke'),
                ('Cillian Murphy'),
                ('Robert Pattinson'),
                ('Emily Blunt'),
                ('Bodzio Bodzio'),
                ('Efi Gonzales Hernandez'),
                ('Rolf Lassgård'),
                ('Lena Endre'),
                ('Gunilla Bergström'),
                ('Petter Lennstrand'),
                ('Shima Niavarani'),
                ('Johan Rheborg'),
                ('Tomas von Brömssen')";
        command.ExecuteNonQuery();
      }

      // Seed film_actors
      command.CommandText = "SELECT COUNT(*) FROM film_actors";
      if (Convert.ToInt32(command.ExecuteScalar()) == 0)
      {
        command.CommandText = @"INSERT INTO film_actors (film_id, actor_id) VALUES
                (1, 1),
                (1, 2),
                (12, 4),
                (12, 6),
                (13, 5),
                (10, 8),
                (15, 11),
                (15, 12),
                (14, 13),
                (14, 14),
                (14, 15),
                (11, 4),
                (7, 9),
                (7, 10)";
        command.ExecuteNonQuery();
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error seeding Filmvisarna data: {ex.Message}");
      throw;
    }
  }

}
