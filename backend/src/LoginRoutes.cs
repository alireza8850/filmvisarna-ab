namespace WebApp;

public static class LoginRoutes
{
  private static Obj GetUser(HttpContext context)
  {
    return Session.Get(context, "user");
  }

  public static void Start()
  {
        App.MapPost("/api/register", (HttpContext context, JsonElement bodyJson) =>
    {
      var body = JSON.Parse(bodyJson.ToString());

      // validering
      if (string.IsNullOrWhiteSpace((string)body.email) ||
          string.IsNullOrWhiteSpace((string)body.password) ||
          string.IsNullOrWhiteSpace((string)body.firstName) ||
          string.IsNullOrWhiteSpace((string)body.lastName))
      {
        return RestResult.Parse(context, new { error = "Ogiltig information." });
      }

      // kollar om email redan finns 
      var existingUser = SQLQueryOne(
              "SELECT id FROM users WHERE email = @email",
              new { body.email }
          );
      if (existingUser != null)
      {
        return RestResult.Parse(context, new { error = "Email redan finns." });
      }

      // Hantera password encryption 
      var parsed = ReqBodyParse("users", body);
      var columns = parsed.insertColumns;
      var values = parsed.insertValues;
      var sql = $"INSERT INTO users({columns}) VALUES({values})";
      
      try
      {
        var result = SQLQueryOne(sql, parsed.body, context);

        if (result.HasKey("error"))
        {
          return RestResult.Parse(context, result);
        }

        return RestResult.Parse(context, new { message = "Ditt konto har registrerats." });
      }
      catch (Exception ex)
      {
        return RestResult.Parse(context, new { error = ex.Message });
      }
    });
    App.MapPost("/api/login", (HttpContext context, JsonElement bodyJson) =>
    {
      var user = GetUser(context);
      var body = JSON.Parse(bodyJson.ToString());

      // If there is a user logged in already
      if (user != null)
      {
        var already = new { error = "A user is already logged in." };
        return RestResult.Parse(context, already);
      }

      // Find the user in the DB
      var dbUser = SQLQueryOne(
              "SELECT * FROM users WHERE email = @email",
              new { body.email }
          );
      if (dbUser == null)
      {
        return RestResult.Parse(context, new { error = "No such user." });
      }

      // If the password doesn't match
      if (!Password.Verify(
              (string)body.password,
              (string)dbUser.password
          ))
      {
        return RestResult.Parse(context,
                new { error = "Password mismatch." });
      }

      // Add the user to the session, without password
      dbUser.Delete("password");
      Session.Set(context, "user", dbUser);
      
      // Skickar mail vid lyckad inloggning 
      Console.WriteLine("Provar skicka mail.");
      try
      {
        EmailService.SendEmail(body.email, "Login", $"<h1>Hej {body.email}!</h1> <br> <p>Du har lyckats logga in. Välkommen til FILMVISARNA AB</p>");
        Console.WriteLine("Mail skickat!");
      }
      catch (Exception ex)
      {
        Console.WriteLine("Mail misslyckades: " + ex.Message);
      }
        

      // Return the user
      return RestResult.Parse(context, dbUser!);
    });

    App.MapGet("/api/login", (HttpContext context) =>
    {
      var user = GetUser(context);
      return RestResult.Parse(context, user != null ?
              user : new { error = "No user is logged in." });
    });

    App.MapDelete("/api/login", (HttpContext context) =>
    {
      var user = GetUser(context);

      // Delete the user from the session
      Session.Set(context, "user", null);

      return RestResult.Parse(context, user == null ?
              new { error = "No user is logged in." } :
              new { status = "Successful logout." }
          );
    });
  }
}