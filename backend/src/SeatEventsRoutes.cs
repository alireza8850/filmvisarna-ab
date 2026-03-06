namespace WebApp;

public static class SeatEventsRoutes
{
  // List of open SSE connections
  private static List<HttpResponse> connections = new();
  public static void Start()
  { // SSE endpoint to keep the stream alive
    App.MapGet("/api/seats-sse/{showingId}", async (HttpContext context, int showingId) =>
    {
      context.Response.Headers.Add("Content-Type", "text/event-stream");
      context.Response.Headers.Add("Cache-Control", "no-cache");
      context.Response.Headers.Add("Connection", "keep-alive");

      // add the user to the list
      connections.Add(context.Response);

      // delete the user directly if the browser is closed
      context.RequestAborted.Register(() =>
      {
        connections.Remove(context.Response);
      });

      // the live streaming loop/ every 15 seconds
      while (!context.RequestAborted.IsCancellationRequested)
      {
        await context.Response.WriteAsync(": keepalive\n\n");
        await context.Response.Body.FlushAsync();
        await Task.Delay(15000);
      }
    });
  }

  // Send Data ==> convert showing_id + seat_id to JSON ==> connection  
  public static async Task BroadcastSeatBooked(int showingId, long seatId)
  {
    var json = System.Text.Json.JsonSerializer.Serialize(new
    {
      showing_id = showingId,
      seat_id = seatId
    });

    foreach (var conn in connections.ToList())
    {
      try
      {
        await conn.WriteAsync($"data:{json}\n\n");
        await conn.Body.FlushAsync();
      }
      catch
      {
        connections.Remove(conn);
      }
    }

  }
}