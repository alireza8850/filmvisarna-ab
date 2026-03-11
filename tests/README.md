# Automated Test Suite

This project contains automated tests for both the frontend and the API.
Created by Oskar Gyllenör ;^)

## 1. Frontend Component Tests
These tests use **Vitest** and **React Testing Library** to test individual pages and components in isolation, mocking the API and the user context.

### How to run:
```bash
npm test
```
This will run all `.test.tsx` and `.test.ts` files located in the `tests` directory.

### UI tests:
- `tests/ui/LoginPage.test.tsx`: Validates login form, email/password validation, and successful login flow.
- `tests/ui/RegistrationPage.test.tsx`: Validates member registration form and password matching.
- `tests/ui/LandedPageFilms.test.tsx`: Tests film listing, search, and genre filtering.
- `tests/ui/FilmDetailsPage.test.tsx`: Validates that film details and showtimes are displayed correctly.

## 2. API Integration Tests
These tests verify the backend API contract by making real HTTP requests. 

### How to run:
Ensure the backend is running at `http://localhost:3000`.
Then run:
```bash
npm test tests/api
```

### Key tests:
- `tests/api/auth.test.ts`: Tests registration and login endpoints.
- `tests/api/films.test.ts`: Tests film retrieval endpoints.

## 3. End-to-End Tests (Playwright)
These tests use **Playwright** to test the entire application flow as a real user, including navigation, booking, and seat selection across real browsers.

### How to run:
Ensure the backend is running at `http://localhost:3000`.
The frontend will run at `http://localhost:5173` during tests.
Then run:
```bash
npm run test:e2e
```

### Key tests:
- `tests/e2e/booking.spec.ts`: Simulates a complete user journey from selecting a film to completing a booking.