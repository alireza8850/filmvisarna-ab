# Filmvisarna API Contract

Base URL: `/api`\
Content-Type: `application/json; charset=utf-8`\
Time format: ISO 8601 (e.g. `"2026-03-01T18:00:00"`)\
Currency: SEK, decimal with 2 digits (e.g. `140.00`)\
Auth: Session cookie (HTTP-only), created via `POST /api/login`

------------------------------------------------------------------------

## Global Response Conventions

### Error format (standard)

All error responses SHOULD use:

``` json
{ "error": "Human readable message." }
```

### Status Codes

-   **200 OK** -- Successful request\
-   **201 Created** -- Resource created\
-   **400 Bad Request** -- Invalid input\
-   **401 Unauthorized** -- Not logged in / invalid session\
-   **403 Forbidden** -- Not allowed (wrong role)\
-   **404 Not Found** -- Resource missing\

------------------------------------------------------------------------

## Authentication & Authorization

### Roles

-   `customer`\
-   `admin` 

------------------------------------------------------------------------

## POST /api/register

Create a new user account.\
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

**400 Bad Request**

``` json
{ "error": "Invalid registration data." }
```

**409 Conflict**

``` json
{ "error": "Email already registered." }
```

------------------------------------------------------------------------

## POST /api/login

Login registered user and create session cookie.\
Auth: Not required

### Request body

``` json
{
  "email": "fatima@unesco.org",
  "password": "123456"
}
```

### Responses

**200 OK**

``` json
{
  "userId": 3,
  "firstName": "Fatima",
  "lastName": "Al-Murtadha",
  "role": "customer"
}
```

**401 Unauthorized**

``` json
{ "error": "Fel användarnamn eller lösenord." }
```

------------------------------------------------------------------------

## DELETE /api/login

Logout and destroy current session.\
Auth: Required

**200 OK**

``` json
{ "message": "Du är nu utloggad." }
```

------------------------------------------------------------------------

## GET /api/me

Get current authenticated user.\
Auth: Required

**200 OK**

``` json
{
  "userId": 3,
  "email": "fatima@example.com",
  "firstName": "Fatima",
  "lastName": "Al-Murtadha",
  "role": "customer"
}
```

------------------------------------------------------------------------

# Booking Flow (Frontend Navigation Support) For DEMO 2!

1.  Frontend loads film cards:\
    `GET /api/films`

2.  User clicks a movie card → navigates to `/films/{filmId}`

Fortsätter med detta flödet när vi kommer lite längre fram igenom start sidan denna veckan /oskar

------------------------------------------------------------------------

# Films

## GET /api/films

**200 OK**

``` json
[
  {
    "filmId": 1,
    "title": "Avatar 3",
    "genre": "Science fiction",
    "releaseYear": 2025,
    "ageLimit": 12,
    "durationMinutes": 192,
    "posterUrl": "avatar3.jpg"
  }
]
```

------------------------------------------------------------------------

## GET /api/films/{filmId}

**200 OK**

``` json
{
  "filmId": 1,
  "title": "Avatar 3",
  "genre": "Science fiction",
  "releaseYear": 2025,
  "ageLimit": 12,
  "durationMinutes": 192,
  "posterUrl": "avatar3.jpg"
}
```

------------------------------------------------------------------------

# Showings

## GET /api/showings

**200 OK**

``` json
[
  {
    "showingId": 1,
    "filmId": 1,
    "filmTitle": "Avatar 3",
    "hallId": 1,
    "hallName": "Stora salongen",
    "startTime": "2026-03-01T18:00:00"
  }
]
```

------------------------------------------------------------------------

# Seat Map & Availability

## GET /api/showings/{showingId}/seats

**200 OK**

``` json
{
  "hall": {
    "hallId": 1,
    "hallName": "Stora salongen",
    "totalRows": 10,
    "seatsPerRow": 8
  },
  "seats": [
    {
      "seatId": 1,
      "rowNumber": 1,
      "seatNumber": 1,
      "status": "booked"
    }
  ]
}
```

------------------------------------------------------------------------

# Ticket Types & Pricing

## GET /api/tickets/prices

**200 OK**

``` json
[
  { "ticketType": "adult", "price": 140.00 },
  { "ticketType": "senior", "price": 120.00 },
  { "ticketType": "child", "price": 80.00 }
]
```

------------------------------------------------------------------------

# Booking System

## POST /api/bookings

**201 Created**

``` json
{
  "bookingId": 10,
  "bookingNumber": "BK-2026-0123",
  "bookingStatus": "confirmed",
  "filmTitle": "Avatar 3",
  "hallName": "Stora salongen",
  "startTime": "2026-03-01T18:00:00",
  "totalPrice": 220.00
}
```

------------------------------------------------------------------------

# User Dashboard

## GET /api/bookings/my

Auth:  Required

**200 OK**

``` json
[
  {
    "bookingId": 1,
    "bookingNumber": "BK-2026-0001",
    "filmTitle": "Avatar 3",
    "startTime": "2026-03-01T18:00:00",
    "bookingStatus": "confirmed",
    "totalPrice": 320.00
  }
]
```

------------------------------------------------------------------------
