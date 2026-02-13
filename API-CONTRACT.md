Filmvisarna API-Contract
## 1. Authentication & Authorization

Create a new user account / No authentication required
## POST /api/register
    {
    "email": "fatima@unesco.org",
    "firstName": "fatima",
    "lastName": "al-murtadha",
    "phoneNumber": "4765774921",
    "password": "123"
    }

201 Created
{
"message": "Ditt konto har registrerats."
}
400 (Invalid data)
{
"error": "Invalid registration data."
}
409 (Email exists)
{
"error": "Email already registered."
}
Login registered user / Creates session cookie
POST /api/login
{
"email": "string",
"password": "string"
}
200 OK
{
"userId": 3,
"firstName": "fatima",
"lastName": "al-murtadha",
"role": "customer"
}
401
{
"error": "Fel användarnamn eller lösenord."
}
Logout/ Requires active session
DELETE /api/login


{ "message": "Du är nu utloggad" }


GET /api/me


200
{
"userId": 3,
"email": "fatima@example.com",
"firstName": "fatima",
"lastName": "al-murtadha",
"role": "customer"
}
401
{ "error": "Något gick fel." }

POST

2)  Films

Description
Method
JSON
Response


GET /api/films


200
[
{
"filmId": 1,
"title": "Avatar 3",
"genre": "Science fiction",
"releaseYear": 2025,
"ageLimit": 12,
"posterURL": "avatar3.jpg"
}
]
404 (no results)
{ "message": "Inga resultat hittades." }


GET /api/films/{filmId}


200
[
{
"filmId": 1,
"title": "Avatar 3",
"genre": "Science fiction",
"releaseYear": 2025,
"ageLimit": 12,
"posterURL": "avatar3.jpg"
}
]
404 (no results)
{ "error": "Filmen finns inte." }


GET /api/films/{filmId}/showings


200
[
{
"showingId": 1,
"hallId": 1,
"hallName": "Stora salongen",
"startTime": "2026-03-01T18:00:00"
}
]



3)  Showings

- GET /api/showings

1/ 200:

[
{
"showingId": 1,
"filmId": 1,
"filmTitle": "Avatar 3",
"genre": "Science fiction",
"durationMinutes": 192,
"hallId": 1,
"hallName": "Stora salongen",
"startTime": "2026-03-01T18:00:00"
}
]

2/ 400
{ "error": "Filmen finns inte." }


- GET /api/showings/{showingId}

1/ 200:

{
"showingId": 1,
"filmId": 1,
"filmTitle": "Avatar 3",
"hallId": 1,
"hallName": "Stora salongen",
"startTime": "2026-03-01T18:00:00"
}




4) Seat Map & Availability

- GET /api/showings/{showingId}/seats

1/ 200:

{
"hall": {
"hallId": 1,
"hallName": "Stora salongen",
"totalRows": 10,
"seatsPerRow": 10
},
"seats": [
{
"seatId": 1,
"rowNumber": 1,
"seatLetter": "J",
"status": "Booked"
},
{
"seatId": 2,
"rowNumber": 1,
"seatLetter": "B",
"status": "Available"
}
]
}


5) Ticket Types & Pricing

GET /api/tickets/prices

1/ 200

[
{ "ticketType": "adult", "price": 160.00 },
{ "ticketType": "child", "price": 95.00 },
{ "ticketType": "senior", "price": 120.00 }
]


6)  Booking System

POST /api/bookings

Request:

{
"showingId": 1,
"email": "user@example.com",
"tickets": [
{ "seatId": 1, "ticketType": "adult" },
{ "seatId": 2, "ticketType": "child" }
]
}

1/  201:

{
"bookingId": 10,
"bookingNumber": "BK-2026-0123",
"filmTitle": "Avatar 3",
"hallName": "Stora salongen",
"startTime": "2026-03-01T18:00:00",
"tickets": [
{
"seatId": 1,
"rowNumber": 1,
"seatLetter": "J",
"ticketType": "adult",
"price": 160.00
}
],
"totalPrice": 255.00
}


2/ 409 (seat already booked):

{ "error": "En eller flera valda platser är redan bokade." }


7) Booking Cancellation

DELETE /api/bookings/{bookingId}

1/ 200:

{
"message": "Bokningen har avbokats.",
"bookingStatus": "cancelled"
}


8) User Dashboard

GET /api/bookings/my

Auth: Requires login.

1/ 200:

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


9) AI Assistant

POST /api/chat

Request:

{
"messages": [
{ "role": "customer", "content": "Vilka filmer visas idag?" }
]
}


Response:

{
"messages": [
{ "role": "assistant", "content": "Idag visas Avatar 3 kl 18:00..." }
]
}



Authentication & ACL Rules

Public endpoints:

- /api/films
- /api/showings
- /api/showings/{id}/seats
- /api/tickets/prices
- /api/register
- /api/login
- /api/chat

Requires login:

- /api/me
- /api/bookings/my
- /api/bookings (if userId is used)
- /api/bookings/{id} (cancel)

Requires admin:

-  admin endpoints - Nice to have


Status Code Conventions:
-200 OK Successful request
-201 Created - Resource created
-400 Bad Request - Invalid input
-401 Unauthorized - Not logged in
-403 Forbidden - Not allowed
-404 Not Found - Resource missing
