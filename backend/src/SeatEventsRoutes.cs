using System.Collections.Concurrent;
using System.Text.Json;

namespace WebApp;

public static class SeatEventsRoutes
{
  // List of open SSE connections
  // using dictionary in order to handle many connection at the same time
  private static ConcurrentDictionary<int, ConcurrentDictionary<Guid, HttpResponse>> connections = new ConcurrentDictionary<int, ConcurrentDictionary<Guid, HttpResponse>>();
  public static void Start()
  { // SSE endpoint to keep the stream alive
    App.MapGet("/api/seats-sse/{showingId}", async (HttpContext context, int showingId) =>
    {
      context.Response.Headers["Content-Type"] = "text/event-stream";
      context.Response.Headers["Cache-Control"] = "no-cache";
      context.Response.Headers["Connection"] = "keep-alive";

      // create a unique connection id
      var connectionId = Guid.NewGuid();

      // Create the connections for the show if they don't exist
      // get or create showing connections
      var showConnections = connections.GetOrAdd(
          showingId,
          _ => new ConcurrentDictionary<Guid, HttpResponse>()
      );

      showConnections[connectionId] = context.Response;

      Console.WriteLine($"SSE connected: showing {showingId}, connection {connectionId}");

      // Delete the connection on closing
      context.RequestAborted.Register(() =>
         {
           if (connections.TryGetValue(showingId, out var conns))
           {
             conns.TryRemove(connectionId, out _);
             Console.WriteLine($"SSE disconnected: showing {showingId}, connection {connectionId}");
           }
         });

      // the live streaming loop/ every 15 seconds
      while (!context.RequestAborted.IsCancellationRequested)
      {
        try
        {
          await context.Response.WriteAsync(": keepalive\n\n");
          await context.Response.Body.FlushAsync();
          await Task.Delay(15000);
        }
        catch
        {
          break;
        }
      }
    });
  }

  // Send Data ==> convert showing_id + seat_id to JSON ==> the list 
  // Broadcast seat booked 
  public static async Task BroadcastSeatsBooked(int showingId, long seatId)
  {
    var json = System.Text.Json.JsonSerializer.Serialize(new
    {
      showing_id = showingId,
      seat_id = seatId
    });

    if (!connections.TryGetValue(showingId, out var conns))
      return;

    foreach (var conn in conns.ToArray())
    {
      try
      {
        await conn.Value.WriteAsync($"event: seatsBooked\n");
        await conn.Value.WriteAsync($"data: {json}\n\n");
        await conn.Value.Body.FlushAsync();
      }
      catch
      {
        conns.TryRemove(conn.Key, out _);
      }

    }

    Console.WriteLine($"Broadcast seatsBooked: showing {showingId}, seat {seatId}");

  }

  // Release seats after cancelation
  // Broadcast seats released
  public static async Task BroadcastSeatsReleased(int showingId, long[] seatIds)
  {
    var json = System.Text.Json.JsonSerializer.Serialize(new
    {
      showing_id = showingId,
      released_seats = seatIds
    });

    if (!connections.TryGetValue(showingId, out var conns))
      return;

    foreach (var conn in conns.ToArray())
    {
      try
      {
        await conn.Value.WriteAsync($"event: seatsReleased\n");
        await conn.Value.WriteAsync($"data: {json}\n\n");
        await conn.Value.Body.FlushAsync();
      }
      catch
      {
        conns.TryRemove(conn.Key, out _);
      }
    }
    Console.WriteLine($"Broadcast seatsReleased: showing {showingId}");
  }
}