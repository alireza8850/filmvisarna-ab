import type { RouteObject } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../sass/index.scss";
import routes from "./routes";
import App from "./App";
import "../sass/style.css";
import { BookingProvider } from "./utils/BookingContext";
import { UserProvider } from "./utils/UserContext";


// import cookies
import { CookieProvider } from "./CookiesHandler/CookieContext"; 
import CookieBanner from "./CookiesHandler/CookieBanner";
import CookieSettingsModal from "./CookiesHandler/CookieSettingsModal";


// Create a router using settings/content from 'routes.tsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App />
    ),
    children: routes as RouteObject[],
  },
]);

// Create the React root element
createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <UserProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </UserProvider>
  </StrictMode>,
);


// Create the React root element for cookies
createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <CookieProvider>
      <RouterProvider router={router} />
      <CookieBanner />
      <CookieSettingsModal />
    </CookieProvider>
  </StrictMode>,
);