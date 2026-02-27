namespace WebApp;

public static class BookingRoutes
{
  public static void Start()
  {
    // GET /api/showings/:id
    App.MapGet("/api/showings/{id}", (HttpContext context, int id) =>
    {
      var sql = @"
          SELECT s.id, s.film_id, s.hall_id, s.start_time, h.hall_name
          FROM showings s
          JOIN halls h ON s.hall_id = h.id
          WHERE s.id = @id
      ";
      var showing = SQLQueryOne(sql, new { id }, context);

      if (showing == null || showing.error != null)
      {
        return RestResult.Parse(context, new { error = "Showing not found." });
      }

      return RestResult.Parse(context, showing);
    });

    // GET /api/films/:filmId/showings - Get all showings for a specific film
    App.MapGet("/api/films/{filmId}/showings", (HttpContext context, int filmId) =>
    {
      var sql = @"
          SELECT s.id, s.film_id, s.hall_id, s.start_time, h.hall_name
          FROM showings s
          JOIN halls h ON s.hall_id = h.id
          WHERE s.film_id = @filmId
          ORDER BY s.start_time ASC
      ";
      var showings = SQLQuery(sql, new { filmId }, context);

      return RestResult.Parse(context, showings);
    });

    // POST /api/bookings
    App.MapPost("/api/bookings", (HttpContext context, JsonElement bodyJson) =>
    {
      var body = JSON.Parse(bodyJson.ToString());

      // Extract fields from request body
      var showingId = body.showing_id;
      var email = body.email; // Used for receipt, but not saved to DB
      var tickets = (Arr)body.tickets; // Array of { ticket_type_id, seat_id (optional) }

      if (showingId == null || tickets == null)
      {
        return RestResult.Parse(context, new { error = "Missing required fields: showing_id, tickets." });
      }

      // Get user_id if logged in (optional)
      var userId = Session.Get(context, "user")?.id;

      // Fetch showing details
      var showingSql = @"
          SELECT s.id, s.film_id, s.hall_id, s.start_time,
                 f.title as film_title, h.hall_name
          FROM showings s
          JOIN films f ON s.film_id = f.id
          JOIN halls h ON s.hall_id = h.id
          WHERE s.id = @showingId
      ";
      var showing = SQLQueryOne(showingSql, new { showingId }, context);

      if (showing == null || showing.error != null)
      {
        return RestResult.Parse(context, new { error = "Showing not found." });
      }

      // Calculate total price by summing up individual ticket prices
      decimal totalPrice = 0;
      foreach (dynamic ticket in tickets)
      {
        var ticketTypeId = ticket.ticket_type_id;
        var priceSql = @"
            SELECT tp.price
            FROM ticket_prices tp
            WHERE tp.ticket_type_id = @ticketTypeId
            AND CURDATE() BETWEEN tp.valid_from AND tp.valid_to
            LIMIT 1
        ";
        var priceResult = SQLQueryOne(priceSql, new { ticketTypeId }, context);
        if (priceResult != null && priceResult.price != null)
        {
          totalPrice += (decimal)priceResult.price;
        }
      }

      // Generate unique booking number
      var bookingNumber = GenerateBookingNumber();

      // Insert booking
      var insertBookingSql = @"
          INSERT INTO bookings (booking_number, user_id, showing_id, booking_status, total_price)
          VALUES (@bookingNumber, @userId, @showingId, 'confirmed', @totalPrice);
          SELECT LAST_INSERT_ID() as id;
      ";
      var bookingResult = SQLQueryOne(insertBookingSql, new { bookingNumber, userId, showingId, totalPrice }, context);

      if (bookingResult == null || bookingResult.error != null)
      {
        return RestResult.Parse(context, new { error = "Failed to create booking." });
      }

      var bookingId = bookingResult.id;

      // Insert tickets
      foreach (var ticket in tickets)
      {
        // Check if seat_id is provided, otherwise use NULL
        var seatId = ticket.seat_id != null ? (int?)ticket.seat_id : null;

        var ticketSql = @"
            INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
            VALUES (@bookingId, @showingId, @seatId, @ticketTypeId)
        ";
        SQLQuery(ticketSql, new
        {
          bookingId,
          showingId,
          seatId = seatId,
          ticketTypeId = ticket.ticket_type_id
        }, context);
      }
      // Note: I need this function in order to fix the error 
      // 'object' does not contain a definition for 'ticket_type_id'
      // Build ticket lines for email body

      var ticketLines = new List<string>();
      foreach (var ticket in tickets)
      {
        int ticketTypeId = ticket.ticket_type_id;

        string lable = ticketTypeId switch
        {
          1 => "Vuxen",
          2 => "Barn",
          3 => "Pensionär",
          _ => "Biljett"
        };
        ticketLines.Add($"<li>{lable}</li>");
      } 
      string ticketLinesHtml = string.Join("\n", ticketLines);

      // Build confirmation email
      string htmlBody = $@"
        <h2>Bokningsbekräftelse</h2>
        <p>Tack för din bokning! Här är dina bokningsdetaljer:</p>
        <ul>
          <li><strong>Bokningsnummer:</strong> {bookingNumber}</li>
          <li><strong>Film:</strong> {showing.film_title}</li>
          <li><strong>Salong:</strong> {showing.hall_name}</li>
          <li><strong>Datum:</strong> {((DateTime)showing.start_time).ToString("yyyy-MM-dd")}</li>
          <li><strong>Tid:</strong> {((DateTime)showing.start_time).ToString("HH:mm")}</li>
        </ul>
        <h3><strong>Biljetter:</strong></h3>
        <ul>{ticketLinesHtml}</ul>

        <h3>Totalpris:</h3>
        <p><strong>{totalPrice} Kr</strong></p>
        <h3>Viktig information:</h3>
        <ul>
          <li><strong>Ta med denna bekräftelse (utskriven eller digital) till biografen.</strong></li>
          <li><strong>Avbokning måste ske minst 2 timmar innan visningen.</strong></li>
          <li><strong>Betalning sker på plats vid biografen.</strong></li>
          <li><strong>Om du har valt specifika sittplatser, se till att sitta på de angivna platserna.</strong></li>
        </ul>

        <p>Välkommen till vårt biograf och trevlig filmupplevelse!</p>
      ";

      // Send confirmation email (if email is provided)
      try
      {
       EmailService.SendEmail(email, "Bokningsbekräftelse", htmlBody);
      }
      catch (Exception ex)
      {
        // Log email sending failure, but do not fail the booking process
        Console.WriteLine($"Kunde inte skicka bekräftelsemail: {ex.Message}");
      } 

      // Return success response
      context.Response.StatusCode = 201;
      return RestResult.Parse(context, new
      {
        id = bookingId,
        booking_number = bookingNumber,
        booking_status = "confirmed",
        film_title = showing.film_title,
        hall_name = showing.hall_name,
        start_time = showing.start_time,
        total_price = totalPrice
      });
    });

    // GET /api/bookings/my
    App.MapGet("/api/bookings/my", (HttpContext context) =>
    {
      var user = Session.Get(context, "user");
      if (user == null)
      {
        context.Response.StatusCode = 401;
        return RestResult.Parse(context, new { error = "Unauthorized" });
      }

      var sql = @"
          SELECT b.id, b.booking_number, b.booking_status, b.total_price,
                 f.title as film_title, s.start_time
          FROM bookings b
          JOIN showings s ON b.showing_id = s.id
          JOIN films f ON s.film_id = f.id
          WHERE b.user_id = @userId
          ORDER BY b.created_at DESC
      ";

      var bookings = SQLQuery(sql, new { userId = user.id }, context);
      return RestResult.Parse(context, bookings);
    });
  }

  private static string GenerateBookingNumber()
  {
    const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var random = new Random();
    var result = new char[6];
    for (int i = 0; i < 6; i++)
    {
      result[i] = chars[random.Next(chars.Length)];
    }
    return new string(result);
  }
}
