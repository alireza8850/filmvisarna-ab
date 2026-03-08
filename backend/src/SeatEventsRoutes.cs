using System.Collections.Concurrent;

namespace WebApp;

public static class SeatEventsRoutes
{
  // List of open SSE connections
  // using dictionary in order to handle many connection at the same time
  private static ConcurrentDictionary<int, List<HttpResponse>> connections = new ConcurrentDictionary<int, List<HttpResponse>>();
  public static void Start()
  { // SSE endpoint to keep the stream alive
    App.MapGet("/api/seats-sse/{showingId}", async (HttpContext context, int showingId) =>
    {
      context.Response.Headers["Content-Type"] = "text/event-stream";
      context.Response.Headers["Cache-Control"] = "no-cache";
      context.Response.Headers["Connection"] = "keep-alive";

      // Create the connections for the show if they don't exist
      var list = connections.GetOrAdd(showingId, _ => new List<HttpResponse>());
      list.Add(context.Response);

      // Delete the connection on closing
      context.RequestAborted.Register(() =>
         {
           if (connections.TryGetValue(showingId, out var conns))
           {
             conns.Remove(context.Response);
           }
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

  // Send Data ==> convert showing_id + seat_id to JSON ==> the list  
  public static async Task BroadcastSeatBooked(int showingId, long seatId)
  {
    var json = System.Text.Json.JsonSerializer.Serialize(new
    {
      showing_id = showingId,
      seat_id = seatId
    });

    if (!connections.TryGetValue(showingId, out var conns))
      return;

    foreach (var conn in conns.ToList())
    {
      try
      {
        await conn.WriteAsync($"data:{json}\n\n");
        await conn.Body.FlushAsync();
      }
      catch
      {
        conns.Remove(conn);
      }

    }
  }
}