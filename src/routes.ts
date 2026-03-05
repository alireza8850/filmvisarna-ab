import type {JSX} from 'react';
import{createElement} from 'react';
// page components
import AboutPage from './pages/AboutPage.tsx';
import AiChatPage from './pages/AiChatPage.tsx';
import BookingFormPage from './pages/BookingFormPage.tsx';
import CancellationPage from './pages/CancellationPage.tsx';
import ConfirmationPage from './pages/ConfirmationPage.tsx';
import FilmDetailsPage from './pages/FilmDetailsPage.tsx';
import HallDesPage from './pages/HallDesPage.tsx';
import LandedPageFilms from './pages/LandedPageFilms.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import OurVisionPage from './pages/OurVisionPage.tsx';
import ProductDetailsPage from './pages/ProductDetailsPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import SeatSelector from './pages/SeatSelector.tsx';
import TicketPickerPage from './pages/TicketPickerPage.tsx';

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
  BookingFormPage,
  CancellationPage,
  ConfirmationPage,
  FilmDetailsPage,
  HallDesPage,
  LandedPageFilms,
  NotFoundPage,
  OurVisionPage,
  ProductDetailsPage,
  ProductsPage,
  SeatSelector,
  TicketPickerPage
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));