mport { useEffect, useState } from "react";
import type Booking from "../interfaces/Booking";

MyBookingsPage .route = {
  path: "/my-bookings",
  menuLabel: "Mina bokningar",
  index: 3,
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings/my", { credentials: "include" });
      if (res.status === 401) {
        setError("Du måste vara inloggad för att se dina bokningar.");
        setBookings([]);
        return;
      }
      if (!res.ok) {
        setError("Kunde inte hämta bokningar.");
        setBookings([]);
        return;
      }
      const data = (await res.json()) as Booking[];
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError("Kunde inte hämta bokningar.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
    }
useEffect(() => {
    fetchBookings();
}, [])
 async function handleCancel(booking: Booking) {
    if (!window.confirm(`Vill du avboka bokning #${booking.booking_number}?`)) return;

    setCancellingId(booking.id);
    setCancelMessage(null);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ booking_number: booking.booking_number, email: "" }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || data?.error) {
        setCancelMessage({ text: data?.error ?? "Något gick fel vid avbokning.", ok: false });
      } else {
        setCancelMessage({ text: "Bokningen har avbokats.", ok: true });
        await fetchBookings();
      }
    } catch {
      setCancelMessage({ text: "Något gick fel vid avbokning.", ok: false });
    } finally {
      setCancellingId(null);
    }
  }