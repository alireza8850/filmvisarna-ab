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
        var ticketTypeId = ticket.ticket_type_id != null ? (long)ticket.ticket_type_id : 0;
        if (ticketTypeId == 0) continue;

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

      // 
      // Build the cancelation URL (for email body)
      // We need first to determine email based on login status.
      // If user is logged in, use their email. Otherwise, use the email provided in the session.

      var user = Session.Get(context, "user"); // an object containing user details if logged in, otherwise null

      string emailToSend;

      if (user != null)
      {
        // Logged-in user ==> use email from DB
        emailToSend = (string)user.email;

      }
      else
      {
        // Visitor ==> must provide email in body 
        if (body.email == null || body.email == "")
        {
          return RestResult.Parse(context, new { error = "E-postadress är obligatorisk för besökare" });
        }
        emailToSend = (string)body.email;
      }
      string cancellationUrl = $"http://localhost:5173/cancel?booking={bookingNumber}&email={emailToSend}";
      // Insert booking
      var insertBookingSql = @"
          INSERT INTO bookings (booking_number, user_id, showing_id, booking_status, total_price, booking_email)
          VALUES (@bookingNumber, @userId, @showingId, 'confirmed', @totalPrice, @email)
      ";
      var insertResult = SQLQueryOne(insertBookingSql, new { bookingNumber, userId, showingId, totalPrice, email = emailToSend }, context);

      if (insertResult == null || insertResult.error != null)
      {
        return RestResult.Parse(context, new { error = "Failed to create booking." });
      }

      var bookingId = insertResult.lastInsertId != null ? (long)insertResult.lastInsertId : 0;
      if (bookingId == 0)
      {
        return RestResult.Parse(context, new { error = "Failed to retrieve booking ID." });
      }

      /* handle double-booking otherwise one seat or more */
      // 1- get all the needed seats
      var seatIds = new List<long>();

      foreach (var t in tickets)
      {
        var ticket = (dynamic)t;

        if (ticket.seat_id != null)
        {
          seatIds.Add((long)ticket.seat_id);
        }
      }

      var seatIdsArray = seatIds.ToArray();

      // 2- check if all chosen seats are available
      if (seatIdsArray.Length > 0)
      {
        var takenSeats = SQLQuery(
            "SELECT seat_id FROM tickets WHERE showing_id = @showingId AND seat_id IN @seatIds",
            new { showingId, seatIds = seatIdsArray },
            context
        );
        Console.WriteLine("TYPE = " + takenSeats.GetType());
        if (takenSeats.Count() > 0)
        {
          return RestResult.Parse(context, new
          {
            error = "En eller flera platser är redan bokade."
          });
        }



      }

      // 3- try / catch in order to handle the UNIQUE constraint showing_id and seat_id 

      // Insert tickets
      try
      {
        foreach (var ticket in tickets)
        {
          // Check if seat_id is provided, otherwise use NULL
          var seatId = ticket.seat_id != null ? (long?)ticket.seat_id : null;
          var ticketTypeId = ticket.ticket_type_id != null ? (long)ticket.ticket_type_id : 0;
          if (ticketTypeId == 0) continue;

          var ticketSql = @"
            INSERT INTO tickets (booking_id, showing_id, seat_id, ticket_type_id)
            VALUES (@bookingId, @showingId, @seatId, @ticketTypeId)
        ";
          SQLQuery(ticketSql, new
          {
            bookingId,
            showingId,
            seatId = seatId,
            ticketTypeId = ticketTypeId
          }, context);

          // broadcast realtime seat update
          if (seatId != null)
          {
            _ = SeatEventsRoutes.BroadcastSeatBooked((int)showingId, seatId.Value);
          }
        }
      }
      catch (Exception ex)
      {
        if (ex.Message.Contains("UNIQUE"))
        {
          return RestResult.Parse(context, new
          {
            error = "Platsen blev precis bokad av en annan användare."
          });
        }

        throw;
      }
      // Note: I need this function in order to fix the error 
      // 'object' does not contain a definition for 'ticket_type_id'
      // Build ticket lines for email body

      var ticketLines = new List<string>();
      foreach (var ticket in tickets)
      {
        var ticketTypeIdRaw = ticket.ticket_type_id;
        if (ticketTypeIdRaw == null) continue;
        long ticketTypeId = (long)ticketTypeIdRaw;

        string label = ticketTypeId switch
        {
          1 => "Vuxen",
          2 => "Barn",
          3 => "Pensionär",
          _ => "Biljett"
        };
        ticketLines.Add($"<li>{label}</li>");
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
          <li><strong>Datum:</strong> {DateTime.Parse(showing.start_time).ToString("yyyy-MM-dd")}</li>
          <li><strong>Tid:</strong> {DateTime.Parse(showing.start_time).ToString("HH:mm")}</li>
        </ul>
        <h3><strong>Biljetter:</strong></h3>
        <ul>{ticketLinesHtml}</ul>

        <h3>Totalpris:</h3>
        <p><strong>{totalPrice} Kr</strong></p>
        <h3>Avbokning:</h3>
        <p>Om du behöver avboka din bokning, klicka på länken nedan:</p>
        <p><a href='{cancellationUrl}'>Avboka min bokning</a></p>

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
        EmailService.SendEmail(emailToSend, "Bokningsbekräftelse", htmlBody);
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

    // POST /api/bookings/cancel
    App.MapPost("/api/bookings/cancel", (HttpContext context, JsonElement bodyJson) =>
    {
      var body = JSON.Parse(bodyJson.ToString());
      string bookingNumber = (string)body.booking_number;
      string email = (string)body.email;

      if (string.IsNullOrWhiteSpace(bookingNumber) || string.IsNullOrWhiteSpace(email))
      {
        return RestResult.Parse(context, new { error = "E-post och bokningsnummer är obligatoriska." });
      }

      // Fetch booking by booking number
      var booking = SQLQueryOne(
        "SELECT * FROM bookings WHERE booking_number = @booking_number",
        new { booking_number = bookingNumber }
      );
      // Check if booking exists and is not already canceled
      if (booking == null)
      {
        return RestResult.Parse(context, new { error = "Ingen bokning hittades med det angivna bokningsnumret." });
      }
      // Check if the booking is already cancelled
      if ((string)booking.booking_status == "cancelled")
      {
        return RestResult.Parse(context, new { error = "Bokningen är redan avbokad." });
      }

      // check if logged-in user?
      var user = Session.Get(context, "user");
      if (user != null)
      {
        // verify owner via user_id
        if ((long?)booking.user_id != (long)user.id)
        {
          return RestResult.Parse(context, new { error = "Du har inte behörighet att avboka denna boking." });
        }
      }
      else
      {
        // visitor ==> verify email storedin booking_email
        string bookingEmail = (string)booking.booking_email;
        if (bookingEmail != email)
        {
          return RestResult.Parse(context, new { error = "E-post matchar inte bokningens email." });
        }
      }
      // Check if the showing is more than 2 hours away
      var showing = SQLQueryOne(
        "SELECT * FROM showings WHERE id = @id",
        new { id = booking.showing_id }
      );
      DateTime startTime = DateTime.Parse((string)showing.start_time);

      // Avbokning måste ske minst 2 timmar innan visningen
      if (DateTime.Now > startTime.AddHours(-2))
      {
        return RestResult.Parse(context, new { error = "Avbokning måste ske minst 2 timmar innan visningen." });
      }
      // Cancel the booking and associated tickets

      // bring all seats of the booking 
      var seats = SQLQuery(
          "SELECT seat_id FROM tickets WHERE booking_id = @bookingId AND seat_id IS NOT NULL",
          new { bookingId = booking.id }
      );

      var releasedSeatIds = new List<long>();
      foreach (var s in seats)
      {
        releasedSeatIds.Add((long)s.seat_id);
      }

      // Release seats
      SQLQuery(
          "DELETE FROM tickets WHERE booking_id = @bookingId",
          new { bookingId = booking.id }
      );

      // Update booking-status
      SQLQuery(
        "UPDATE bookings SET booking_status = 'cancelled' WHERE id = @bookingId",
        new { bookingId = booking.id }
      );

      // Send SSE-event to all clients
      if (releasedSeatIds.Count > 0)
      {
        _ = SeatEventsRoutes.BroadcastSeatsReleased(
            (int)booking.showing_id,
            releasedSeatIds.ToArray()
        );
      }

      return RestResult.Parse(context, new { message = "Bokningen har avbokats." });
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
