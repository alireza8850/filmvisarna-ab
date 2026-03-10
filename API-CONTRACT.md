# Filmvisarna API Contract

## Global Response Conventions

### Error format (standard)

All error responses use:

``` json
{ "error": "Human readable message." }
```

### Status Codes

-   **200 OK** -- Successful request
-   **201 Created** -- Resource created
-   **400 Bad Request** -- Invalid input
-   **401 Unauthorized** -- Not logged in / invalid session
-   **403 Forbidden** -- Not allowed (wrong role)
-   **404 Not Found** -- Resource missing

------------------------------------------------------------------------

## Authentication & Authorization

### Roles

-   `visitor` ==> Not logged in
-   `user` ==> Logged-in user
-   `staff` ==> Filmvisarna's employee
-   `admin` ==> Full system access

------------------------------------------------------------------------

### Note: 
- Registration always creates a `user`.
- `staff` and `admin` roles are assigned manually in the database.
- Access Control List (ACL) in the database controls access to all routes.

## POST /api/register

Create a new user account.
Auth: Not required

### Request body

``` json
{
  "email": "fatima@unesco.org",
  "firstName": "Fatima",
  "lastName": "Al-Murtadha",
  "phoneNumber": "4765774921",
  "password": "123456"
}
```

### Responses

**201 Created**

``` json
{ "message": "Ditt konto har registrerats." }
```

**400 Bad Request / 409 Conflict**

``` json
{ "error": "Ogiltig information." }
OR
{ "error": "Email redan finns." }
```

------------------------------------------------------------------------

## POST /api/login

Login registered user and create session cookie.
Auth: Not required

### Request body

``` json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Responses

**200 OK**

``` json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "FirstName",
  "lastName": "LastName",
  "role": "user"
}
```

**401 Unauthorized**

``` json
{ "error": "Fel lösenord." }
OR
{ "error": "Ingen användare hittades." }
```

------------------------------------------------------------------------

## GET /api/login

Get current authenticated user session.
Auth: Required

**200 OK**

``` json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "FirstName",
  "lastName": "LastName",
  "role": "user"
}
```

**401 Unauthorized**

``` json
{ "error": "No user is logged in." }
```

------------------------------------------------------------------------

## DELETE /api/login

Logout and destroy current session.
Auth: Required

**200 OK**

``` json
{ "status": "Successful logout." }
```

------------------------------------------------------------------------

# Films

## GET /api/films

List all films. Supports filtering.
Auth: Not Required

### Query Parameters
- `search`: Filter by title (substring match)
- `genre`: Filter by genre
- `ageLimit`: Filter by age limit

**200 OK**

``` json
[
  {
    "id": 1,
    "title": "Avatar 3",
    "genre": "Science fiction",
    "release_year": 2025,
    "age_limit": 12,
    "poster_url": "avatar3.jpg",
    "is_featured": true
  }
]
```

------------------------------------------------------------------------

## GET /api/films/{id}

Get full film details, including actors.
Auth: Not Required

**200 OK**

``` json
{
  "id": 1,
  "title": "Avatar 3",
  "duration_minutes": 192,
  "genre": "Science fiction",
  "release_year": 2025,
  "age_limit": 12,
  "description": "...",
  "language": "Svenska",
  "poster_url": "avatar3.jpg",
  "trailer_url": "avatar3_trailer.mp4",
  "actors": ["Actor Name 1", "Actor Name 2"]
}
```

------------------------------------------------------------------------

## POST /api/release-movie

Release a new movie and automatically generate showtimes for the next 7 days.
Auth: visitor, user, staff, admin (Currently open to all for demo purposes)

### Request body

``` json
{
  "title": "New Movie",
  "duration_minutes": 120,
  "genre": "Action",
  "release_year": 2026,
  "age_limit": 15,
  "description": "A very exciting movie.",
  "language": "Engelska",
  "poster_url": "url_to_poster.jpg",
  "trailer_url": "url_to_trailer.mp4",
  "actors": ["Actor A", "Actor B"]
}
```

### Responses

**200 OK**

``` json
{ "success": true, "newFilmId": 42 }
```

------------------------------------------------------------------------

# Showings

## GET /api/showings

List all showings (via Generic REST API).
Auth: Not Required

**200 OK**

``` json
[
  {
    "id": 1,
    "film_id": 1,
    "hall_id": 1,
    "start_time": "2026-03-01T18:00:00"
  }
]
```

------------------------------------------------------------------------

## GET /api/showings/{id}

Get specific showing details including hall name.
Auth: Not Required

**200 OK**

``` json
{
  "id": 1,
  "film_id": 1,
  "hall_id": 1,
  "start_time": "2026-03-01T18:00:00",
  "hall_name": "Stora salongen"
}
```

------------------------------------------------------------------------

## GET /api/films/{filmId}/showings

Get all showings for a specific film.
Auth: Not Required

**200 OK**

``` json
[
  {
    "id": 1,
    "film_id": 1,
    "hall_id": 1,
    "start_time": "2026-03-01T18:00:00",
    "hall_name": "Stora salongen"
  }
]
```

------------------------------------------------------------------------

# Seats & Real-time Updates

## GET /api/showings/{showingId}/seats

List all seats for a showing and their status (via Generic REST API/Custom logic).
Note: Implementation details for specific seat status might vary depending on whether it's fetched via `seats` table or joined with `tickets`.

------------------------------------------------------------------------

## GET /api/seats-sse/{showingId}

Server-Sent Events (SSE) stream for real-time seat booking/release updates.
Auth: Not Required

### Events
- `seatsBooked`: Sent when a seat is booked.
  - Data: `{ "showing_id": 1, "seat_id": 5 }`
- `seatsReleased`: Sent when seats are released (cancellation).
  - Data: `{ "showing_id": 1, "released_seats": [5, 6] }`
- `keepalive`: Sent every 15 seconds to keep connection alive.

------------------------------------------------------------------------

# Ticket Types & Pricing

## GET /api/tickets/prices

List current ticket prices based on type.
Auth: Not Required

**200 OK**

``` json
[
  { "ticket_type_id": 1, "price": 140.00, "valid_from": "...", "valid_to": "..." },
  { "ticket_type_id": 2, "price": 80.00, "valid_from": "...", "valid_to": "..." }
]
```

------------------------------------------------------------------------

# Booking System

## POST /api/bookings

Create a booking. Can be done as a logged-in user or a visitor (requires email).
Auth: visitor, user, staff, admin.

### Request body

``` json
{
  "showing_id": 1,
  "email": "visitor@example.com",
  "tickets": [
    { "ticket_type_id": 1, "seat_id": 10 },
    { "ticket_type_id": 2, "seat_id": 11 }
  ]
}
```

### Responses

**201 Created**

``` json
{
  "id": 10,
  "booking_number": "BK-XXXXXX",
  "booking_status": "confirmed",
  "film_title": "Avatar 3",
  "hall_name": "Stora salongen",
  "start_time": "2026-03-01T18:00:00",
  "total_price": 220.00
}
```

------------------------------------------------------------------------

## POST /api/bookings/cancel

Cancel a booking. Requires booking number and email for verification.
Auth: visitor, user, staff, admin.

### Request body

``` json
{
  "booking_number": "BK-XXXXXX",
  "email": "user@example.com"
}
```

### Responses

**200 OK**

``` json
{ "message": "Bokningen har avbokats och platserna har släppts." }
```

------------------------------------------------------------------------

## GET /api/bookings/my

Get bookings for the logged-in user.
Auth: Required (user, staff, admin).

**200 OK**

``` json
[
  {
    "id": 10,
    "booking_number": "BK-XXXXXX",
    "booking_status": "confirmed",
    "total_price": 220.00,
    "film_title": "Avatar 3",
    "start_time": "2026-03-01T18:00:00"
  }
]
```

------------------------------------------------------------------------

# Generic REST API

Most tables are accessible via generic endpoints:
`GET /api/{table}`
`GET /api/{table}/{id}`
`POST /api/{table}`
`PUT /api/{table}/{id}`
`DELETE /api/{table}/{id}`

Available tables: `films`, `halls`, `seats`, `showings`, `ticket_types`, `ticket_prices`, `bookings`, `tickets`, `users`, `actors`, `film_actors`, `acl`.

### Generic Querying
Supports `where`, `orderby`, `limit`, and `offset` as query parameters.
Example: `/api/films?where=genre=Action&orderby=-release_year&limit=5`
