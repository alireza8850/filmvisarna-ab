
### Filmvisarna AB – Bokningssystem för biograf

Filmvisarna AB är ett fullständigt bokningssystem för en biograf där användare kan:

- Se filmer och visningar  
- Välja biljetter och platser  
- Genomföra bokning  
- Logga in / logga ut  
- Administrera filmer, salonger och visningar (admin)  

Systemet består av:

- Frontend: React + TypeScript  
- Backend: .NET Minimal API  
- Databas: MySQL  
- Autentisering: Cookies + sessions  

### Teknikstack
Frontend: Vite + React + TypeScript + Bootstrap + Sass Backend: .NET 10 Minimal API + DynData Databas: MySQL

### Arkitektur
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│              Vite + React + TypeScript                      │
│                 Bootstrap + Sass                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (REST API)
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                              │
│                   .NET 10 Minimal API                       │
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────────┐  │
│  │      App.cs         │    │     db-config.json         │  │
│  │  ─────────────────  │    │  ────────────────────────  │  │
│  │  debugOn            │    │  host                      │  │
│  │  detailedAclDebug   │    │  port                      │  │
│  │  aclOn              │    │  username                  │  │
│  │  isSpa              │    │  password                  │  │
│  │  port               │    │  database                  │  │
│  │  serverName         │    │  createTablesIfNotExist    │  │
│  │  frontendPath       │    │  seedDataIfEmpty           │  │
│  │  sessionLifeTimeHours│   └────────────────────────────┘  │
│  └─────────────────────┘                                    │
│                                                             │
│  DynData: Dynamisk C# (Obj, Arr, JSON, Log)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ MySqlConnector
┌─────────────────────▼───────────────────────────────────────┐
│                        MySQL                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ sessions │ │   acl    │ │  users   │ │ products │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘





### Installation

1. Klona projektet
`bash
git clone https://github.com/alireza8850/filmvisarna-ab.git
`

2. Kopiera databas-konfigurationen och fyll i värden:
 cp backend/db-config.template.json backend/db-config.json

3. Redigera backend/db-config.json med rätt uppgifter (host, port, username, password, database)

4. Installera och starta:
 npm install
 npm run dev

## Konfiguration

### App-inställningar (backend/src/App.cs)
. aclOn - Slå på/av ACL-systemet
. debugOn - Aktivera debug-loggning
. sessionLifeTimeHours - Sessionens livslängd

### Databas-inställningar (backend/db-config.json)
. createTablesIfNotExist - Skapa tabeller automatiskt vid uppstart
. seedDataIfEmpty - Fyll tabeller med exempeldata om de är tomma


### Om REST-api:t
## Fem standardroutes per tabell
Självklart har vi det grundläggande för alla REST-API:er täckt. För vilken tabell som helst, ersätt tabellnamn nedan med ett tabellnamn och id med ett specifikt id:
. POST /api/tabellnamn - med en request body i JSON-format - skapa en ny rad i tabellen och få tillbaka insert-id:t.
. GET /api/tabellnamn - hämta alla rader från tabellen som en JSON-array med objekt.
. GET /api/tabellnamn/id - hämta raden från tabellen med ett specifikt id som ett JSON-objekt. (Obs: Du måste namnge dina id-kolumner i dina tabeller bara "id", inte "elefantId" etc).
. PUT /api/tabellnamn/id - ändra en eller flera egenskaper för en befintlig rad. Skicka en request body i JSON-format som endast innehåller de fält/kolumner du vill ändra.
. DELETE /api/tabellnamn/id - ta bort en specifik rad i tabellen.

## Mer än bara standardroutes
. Du kan använda (upp till) fyra olika query-parametrar för GET-förfrågan utan id för att göra mycket mer, och hitta det du letar efter direkt:
. where = villkor, för att filtrera returnerade poster
. orderby = fält1,[fält2... etc] för att sortera returnerade poster. För fallande sortering, sätt ett "-" före fältnamnet
. limit = antalPoster, för att begränsa antalet poster
. offset = antalPoster, för att hoppa över ett antal poster i början.

## Ett exempel:

. /api/users?where=firstName=Thomas_AND_lastName!=Irons&orderby=email&limit=2&offset=1
. Obs: Omge inte strängar med citattecken, som du kan se i exemplet ovan gör vi inte det.

## För närvarande stödda operatorer för where
. !=, >=, <=, =, >, <, AND, OR, LIKE (att skriva de tre sista med understreck är valfritt men förbättrar läsbarheten)
. Parenteser stöds för närvarande inte.

## Söka i JSON-fält med CONTAINS




### Viktigt att veta
- Systemet använder sessionscookies för inloggning.  
- Bokningssystemet hanterar double booking genom backend-validering.  
- Endast inloggade användare kan administrera filmer och visningar.  
- Projektet är byggt för utbildningssyfte men följer verkliga arkitekturprinciper.

---

### 2) Dokumentation – Teknisk skuld (Technical Debt)

Detta är en lista över verkliga tekniska skulder i ert projekt:

## Backend
- Vissa endpoints saknar fullständig felhantering (t.ex. 409 vs 500).  
- Ingen global exception middleware.  
- Ingen rate limiting eller skydd mot brute force login.  
- Vissa SQL-frågor kan optimeras (t.ex. join istället för flera queries).  

## Frontend
- Vissa komponenter är för stora och borde delas upp (BookingFormPage, TicketPickerPage).  
- CSS/SCSS är delvis oorganiserad och saknar konsekvent struktur.  
- Ingen global error boundary i React.  
- Ingen loading-state på vissa sidor som hämtar data.  

## Testning
- Inga enhetstester för backend.  
- Inga integrationstester för bokningsflödet.  
- Ingen mockning av API i frontend.  

---

## 3) Lösningsarkitektur (Solution Architecture)

Här är en professionell sammanfattning av er arkitektur:

# Översikt
Systemet följer en klassisk client–server-arkitektur:

- Frontend (React) ansvarar för UI, routing och state management.  
- Backend (.NET Minimal API) ansvarar för affärslogik, autentisering och datalagring.  
- Databas (MySQL) lagrar filmer, visningar, salonger, platser och bokningar.

# Kommunikation
- Frontend kommunicerar med backend via REST API.  
- Autentisering sker via sessionscookies (credentials: include).  

# Databasmodell
Centrala tabeller:

- films  
- showings  
- halls  
- seats  
- bookings  
- tickets  
- users  


### Autentisering & behörighet
- Inloggning skapar en session-cookie.  
- Backend kontrollerar sessionen vid varje request.  
- Admin har utökade rättigheter.  

### Bokningsflöde
1. Användaren väljer biljetter  
2. Användaren väljer platser  
3. Backend validerar att platserna är lediga  
4. Vid konflikt returneras 409 Conflict  
5. Vid lyckad bokning sparas biljetter + platser  

### State Management
- BookingContext hanterar valda biljetter och platser  
- UserContext hanterar inloggad användare  

---

## 4) Planerat men ej genomfört arbete

Detta är realistiska punkter som ni kan skriva:

### Funktioner som var planerade men inte hanns med
- E-postbekräftelse vid bokning  
- Möjlighet att avboka biljetter via länk  
- Statistikpanel för admin  
- Bättre hantering av seat-locking (tidsbegränsad reservation)  
- Responsiv förbättring av SeatSelector  
- Lösenordsåterställning via e-post  
- CI/CD pipeline  
- Enhetstester och integrationstester  

---

### Nästa steg

Jag kan nu hjälpa dig skapa:

- En PDF med all dokumentation  
- En arkitekturdiagram (system overview)  
- En databasdiagram  
- En teknisk skuld-tabell i snygg format  
- En sammanfattning för presentationen inför arkitekturgranskningen

## Team & GitHub-användare
Projektet har utvecklats av:

- Fatima Al-Murtadha: https://github.com/FatimaAlMurtadha / https://www.linkedin.com/in/fatima-al-murtadha-8a19b9294/ 
- Oskar Gyllenör: https://github.com/OskarUNLEASHED / www.linkedin.com/in/oskar-gyllenör-40778a291 
- Ali Reza Merzai: https://github.com/alireza8850 / https://www.linkedin.com/in/ali-reza-merzai-235960190/  
- Arbaz Shah: https://github.com/arbazshah52 / http://linkedin.com/in/syed-arbaz-hussain-shah-788921100 
- Neha Asati: https://github.com/Nehaasati / 

### Minimal API + React Fullstack