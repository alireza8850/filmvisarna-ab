namespace WebApp;

public static class DbQuery
{
  // Setup the database connection from config
  private static string connectionString;

  // JSON columns for _CONTAINS_ validation
  public static Arr JsonColumns = Arr(new[] { "categories" });

  public static bool IsJsonColumn(string column) => JsonColumns.Includes(column);

  static DbQuery()
  {
    var configPath = Path.Combine(
        AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
    );
    var configJson = File.ReadAllText(configPath);
    var config = JSON.Parse(configJson);

    connectionString =
        $"Server={config.host};Port={config.port};Database={config.database};" +
        $"User={config.username};Password={config.password};";

    var db = new MySqlConnection(connectionString);
    db.Open();

    // Create tables if they don't exist
    if (config.createTablesIfNotExist == true)
    {
      CreateTablesIfNotExist(db);
      // To create filmvisarna's tables 
      FilmvisarnaTables.CreateTablesIfNotExist(db); 
    }

    // Seed data if tables are empty
    if (config.seedDataIfEmpty == true)
    {
      SeedDataIfEmpty(db);
      FilmvisarnaTables.SeedFilmvisarnaData(db);
    }

    // Temporary: Ensure booking ACL rules exist even if already seeded
    try
    {
      var aclCheckCmd = db.CreateCommand();
      aclCheckCmd.CommandText = "SELECT COUNT(*) FROM acl WHERE route = '/api/bookings' AND method = 'POST'";
      if (Convert.ToInt32(aclCheckCmd.ExecuteScalar()) == 0)
      {
        var fixAclCmd = db.CreateCommand();
        fixAclCmd.CommandText = @"
                INSERT INTO acl (userRoles, method, allow, route, `match`, comment) VALUES
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/halls', 'true', 'Allow all user roles to read halls'),
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/seats', 'true', 'Allow all user roles to read seats'),
                ('visitor,user,staff,admin', 'POST', 'allow', '/api/bookings', 'true', 'Allow all user roles to create bookings'),
                ('visitor,user,staff,admin', 'POST', 'allow', '/api/tickets', 'true', 'Allow all user roles to create tickets');
            ";
        fixAclCmd.ExecuteNonQuery();
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine("Error applying one-time ACL fix: " + ex.Message);
    }

    db.Close();
  }

  private static void CreateTablesIfNotExist(MySqlConnection db)
  {
    var createTablesSql = @"
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(255) PRIMARY KEY NOT NULL,
                created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                data JSON
            );

            CREATE TABLE IF NOT EXISTS acl (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                userRoles VARCHAR(255) NOT NULL,
                method VARCHAR(50) NOT NULL DEFAULT 'GET',
                allow ENUM('allow', 'disallow') NOT NULL DEFAULT 'allow',
                route VARCHAR(255) NOT NULL,
                `match` ENUM('true', 'false') NOT NULL DEFAULT 'true',
                comment VARCHAR(500) NOT NULL DEFAULT '',
                UNIQUE KEY unique_acl (userRoles, method, route)
            );

            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                created DATE DEFAULT (CURDATE()) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                phoneNumber VARCHAR(50),
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                password VARCHAR(255) NOT NULL
            );

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

  private static void SeedDataIfEmpty(MySqlConnection db)
  {
    // Check if tables are empty and seed if needed
    var command = db.CreateCommand();

    // Seed ACL rules
    command.CommandText = "SELECT COUNT(*) FROM acl";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var aclData = @"
                INSERT INTO acl (userRoles, method, allow, route, `match`, comment) VALUES
                ('visitor, user', 'GET', 'disallow', '/secret.html', 'true', 'No access to /secret.html for visitors and normal users'),
                ('visitor,user, admin', 'GET', 'allow', '/api', 'false', 'Allow access to all routes not starting with /api'),
                ('visitor', 'POST', 'allow', '/api/users', 'true', 'Allow registration as new user for visitors'),
                ('visitor, user,admin', '*', 'allow', '/api/login', 'true', 'Allow access to all login routes'),
                ('visitor,user,admin', 'POST', 'allow', '/api/chat', 'true', 'Allow all user roles to access AI chat'),
                ('admin', '*', 'allow', '/api/users', 'true', 'Allow admins to see and edit users'),
                ('admin', '*', 'allow', '/api/sessions', 'true', 'Allow admins to see and edit sessions'),
                ('admin', '*', 'allow', '/api/acl', 'true', 'Allow admins to see and edit acl rules'),
                ('visitor,user,admin', 'GET', 'allow', '/api/products', 'true', 'Allow all user roles to read products'),
                -- Films 
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/films', 'true', 'Allow all user roles to read films'),
                -- Tickets
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/tickets', 'true', 'Allow all user roles to read tickets'),
                 -- Tickets type
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/ticket_types', 'true', 'Allow all user roles to read tickets_types'),
                 -- Tickets prices
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/ticket_prices', 'true', 'Allow all user roles to read ticket_prices'),
                 -- showing
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/showings', 'true', 'Allow all user roles to read showings'),
                -- Halls
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/halls', 'true', 'Allow all user roles to read halls'),
                -- Seats
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/seats', 'true', 'Allow all user roles to read seats'),
                -- Bookings
                ('visitor,user,staff,admin', 'POST', 'allow', '/api/bookings', 'true', 'Allow all user roles to create bookings'),
                -- Booking cancelation
                ('visitor,user,staff,admin', 'POST', 'allow', '/api/bookings/cancel', 'true', 'Allow all user roles to cancel bookings'), 
                -- Tickets (POSTing new tickets during booking)
                ('visitor,user,staff,admin', 'POST', 'allow', '/api/tickets', 'true', 'Allow all user roles to create tickets'),
                -- SSE 
                ('visitor,user,staff,admin', 'GET', 'allow', '/api/seats-sse/', 'false', 'Allow SSE seat updates')
                ;
            ";
      command.CommandText = aclData;
      command.ExecuteNonQuery();
    }

    // Seed users
    command.CommandText = "SELECT COUNT(*) FROM users";
    if (Convert.ToInt32(command.ExecuteScalar()) == 0)
    {
      var usersData = @"
                INSERT INTO users (created, email, firstName, lastName, phoneNumber, role, password) VALUES
                ('2025-12-14', 'fatima@al-murtadha', 'Fatima', 'Al-Murtadha', '(476) 5774921', 'admin', '123'),
                ('2025-12-14', 'neha@unesco.org', 'Neha', 'Tadgell', '(476) 5774922', 'customer', '123'),
                ('2025-04-21', 'arbaz@upenn.edu', 'Arbaz', 'Greenleaf', '(386) 3321896', 'staff', '123'),
                ('2025-09-11', 'oskar@alexa.com', 'Oskar', 'Lummasana', '(651) 5012342', 'staff', '123'),
                ('2025-09-25', 'ali@google.com', 'Ali', 'Dalla', '(920) 6104534', 'customer', '123');
            ";
      command.CommandText = usersData;
      command.ExecuteNonQuery();
    }

    
  }

  // Helper to create an object from the DataReader
  private static dynamic ObjFromReader(MySqlDataReader reader)
  {
    var obj = Obj();
    for (var i = 0; i < reader.FieldCount; i++)
    {
      var key = reader.GetName(i);
      var value = reader.GetValue(i);

      // Handle NULL values
      if (value == DBNull.Value)
      {
        obj[key] = null;
      }
      // Handle DateTime - convert to ISO string
      else if (value is DateTime dt)
      {
        obj[key] = dt.ToString("yyyy-MM-ddTHH:mm:ss");
      }
      // Handle boolean (MySQL returns sbyte for TINYINT(1))
      else if (value is sbyte sb)
      {
        obj[key] = sb != 0;
      }
      else if (value is bool b)
      {
        obj[key] = b;
      }
      // Handle JSON columns (MySQL returns JSON as string starting with [ or {)
      else if (value is string strValue && (strValue.StartsWith("[") || strValue.StartsWith("{")))
      {
        // Special case: Don't parse 'data' column from sessions - keep as string
        if (key == "data")
        {
          obj[key] = strValue;
        }
        else
        {
          try
          {
            obj[key] = JSON.Parse(strValue);
          }
          catch
          {
            // If parsing fails, keep the original value and try to convert to number
            obj[key] = strValue.TryToNum();
          }
        }
      }
      else
      {
        // Normal handling - convert to string and try to parse as number
        obj[key] = value.ToString().TryToNum();
      }
    }
    return obj;
  }

  // Run a query - rows are returned as an array of objects
  public static Arr SQLQuery(
      string sql, object parameters = null, HttpContext context = null
  )
  {
    sql = sql.TrimStart();
    var paras = parameters == null ? Obj() : Obj(parameters);
    using var db = new MySqlConnection(connectionString);
    db.Open();
    var command = db.CreateCommand();
    command.CommandText = @sql;
    var entries = (Arr)paras.GetEntries();
    entries.ForEach(x => command.Parameters.AddWithValue("@" + x[0], x[1]));
    if (context != null)
    {
      DebugLog.Add(context, new
      {
        sqlQuery = sql.Regplace(@"\s+", " "),
        sqlParams = paras
      });
    }
    var rows = Arr();
    try
    {
      if (sql.StartsWith("SELECT ", true, null))
      {
        var reader = command.ExecuteReader();
        while (reader.Read())
        {
          rows.Push(ObjFromReader(reader));
        }
        reader.Close();
      }
      else
      {
        var rowsAffected = command.ExecuteNonQuery();
        rows.Push(new
        {
          command = sql.Split(" ")[0].ToUpper(),
          rowsAffected = rowsAffected,
          lastInsertId = command.LastInsertedId
        });
      }
    }
    catch (Exception err)
    {
      rows.Push(new { error = err.Message });
    }
    return rows;
  }

  // Run a query - only return the first row, as an object
  public static dynamic SQLQueryOne(
      string sql, object parameters = null, HttpContext context = null
  )
  {
    return SQLQuery(sql, parameters, context)[0];
  }
}