# Filmvisarna API Contract
Ska överväga lägga til lite extra detaljer här
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

### Roles (from ACL)

-   `visitor` ==> Not logged in
-   `user` ==> Logged-in user
-   `staff` ==> filmvisarna's employee
-   `admin` ==> full system access

------------------------------------------------------------------------

### Note: 
. Registeration always creates user.
. staff and admin are created manually in DB.
. ACL controls access to all routes.

## POST /api/register

Create a new user account.\
Auth: Not required
ACL: visitor ==> allow

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
ACL: visitor ==> allow

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
  "id": 3,
  "firstName": "Fatima",
  "lastName": "Al-Murtadha",
  "role": "user"
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
ACL: user,staff,admin ==> allow

**200 OK**

``` json
{ "message": "Du är nu utloggad." }
```

------------------------------------------------------------------------

## GET /api/me

Get current authenticated user.\
Auth: Required
ACL: user,staff,admin ==> allow

**200 OK**

``` json
{
  "id": 3,
  "email": "fatima@example.com",
  "firstName": "Fatima",
  "lastName": "Al-Murtadha",
  "role": "user"
}
```

------------------------------------------------------------------------

# Booking Flow (Frontend Navigation Support) For DEMO 2!

1.  Frontend loads film cards:\
    `GET /api/films`

2.  User clicks a movie card → navigates to `/films/{id}`

Fortsätter med detta flödet när vi kommer lite längre fram igenom start sidan denna veckan /oskar

------------------------------------------------------------------------

# Films

## GET /api/films
List all films.
Auth: Not Required
ACL: visitor,user,staff,admin ==> allow

**200 OK**

``` json
[
  {
    "id": 1,
    "title": "Avatar 3",
    "genre": "Science fiction",
    "release_year": 2025,
    "age_limit": 12,
    "duration_minutes": 192,
    "poster_url": "avatar3.jpg"
  }
]
```

------------------------------------------------------------------------

## GET /api/films/{id}
Get full film details.
Auth: Not Required
ACL: visitor,user,staff,admin ==> allow
**200 OK**

``` json
{
  "id": 1,
  "title": "Avatar 3",
  "genre": "Science fiction",
  "release_year": 2025,
  "age_limit": 12,
  "duration_minutes": 192,
  "description": "..." ,
  "language": "Svenska",
  "poster_url": "avatar3.jpg",
  "trailer_url": "avatar3_trailer.mp4" ,
  "actors": ["Actor 1","Actor 2"]
}
```

------------------------------------------------------------------------

# Showings

## GET /api/showings

List all showings
Auth: Not Required
ACL: visitor,user,staff,admin ==> allow

**200 OK**

``` json
[
  {
    "id": 1,
    "film_id": 1,
    "film_title": "Avatar 3",
    "hall_id": 1,
    "hall_name": "Stora salongen",
    "start_time": "2026-03-01T18:00:00"
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
    "hall_id": 1,
    "hall_name": "Stora salongen",
    "total_rows": 10,
    "seats_per_row": 8
  },
  "seats": [
    {
      "seat_id": 1,
      "row_index": 1,
      "seat_number": 1,
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
Create a booking.
Auth: user, staff, admin.
ACL: allow.

**201 Created**

``` json
{
  "id": 10,
  "booking_number": "BK-2026-0123",
  "booking_status": "confirmed",
  "film_title": "Avatar 3",
  "hall_name": "Stora salongen",
  "start_time": "2026-03-01T18:00:00",
  "total_price": 220.00
}
```

------------------------------------------------------------------------

# User Dashboard

## GET /api/bookings/my

Auth:  Required (user,staff, admin).
ACL: allow.

**200 OK**

``` json
[
  {
    "id": 1,
    "booking_number": "BK-2026-0001",
    "film_title": "Avatar 3",
    "start_time": "2026-03-01T18:00:00",
    "booking_status": "confirmed",
    "total_price": 320.00
  }
]
```

------------------------------------------------------------------------
