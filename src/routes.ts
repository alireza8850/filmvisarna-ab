import type { JSX } from "react";
import { createElement } from "react";
// page components
import AboutPage from "./pages/AboutPage.tsx";
import AiChatPage from "./pages/AiChatPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import OurVisionPage from "./pages/OurVisionPage.tsx";
import FilmDetailsPage from "./pages/FilmDetailsPage.tsx";
import LandedPageFilms from "./pages/LandedPageFilms.tsx";
import TicketPickerPage from "./pages/TicketPickerPage.tsx";
import ConfirmationPage from "./pages/ConfirmationPage.tsx";
import BookingFormPage from "./pages/BookingFormPage.tsx";
import CancellationPage from "./pages/CancellationPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import UpcomingMoviesPage from "./pages/UpcomingMoviesPage.tsx";
import UpcomingMovieDetailsPage from "./pages/UpcomingMovieDetailsPage.tsx";
import ContactOssPage from "./pages/contactOssPage.tsx";
import SeatSelector from "./pages/SeatSelector.tsx";
import Bookingstatus from "./pages/Bookingstatus.tsx";
import HallDesPage from "./pages/HalldescPage.tsx";
import PolicyPage from "./pages/policyPage.tsx";

import MatOchDryckPage from "./pages/MatOchDryckPage.tsx";

import AdminLockupPage from "./pages/AdminLockupPage.tsx";
interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
}

export default [
  AboutPage,
  AiChatPage,
  NotFoundPage,
  OurVisionPage,
  LandedPageFilms,
  FilmDetailsPage,
  TicketPickerPage,
  ConfirmationPage,
  BookingFormPage,
  LoginPage,
  CancellationPage,
  RegistrationPage,
  UpcomingMoviesPage,
  UpcomingMovieDetailsPage,
  Bookingstatus,
  ContactOssPage,
  HallDesPage,
  MatOchDryckPage,
  PolicyPage, 
    AdminLockupPage,
]
  // map the route property of each page component to a Route
  .map((x) => ({ element: createElement(x), ...x.route }) as Route)
  .filter(route => route.path) // Ensure each route has a path
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));
