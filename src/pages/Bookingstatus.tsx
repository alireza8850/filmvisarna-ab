import { useEffect, useState } from "react";
import type Booking from "../interfaces/Booking";

Bookingstatus .route = {
  path: "/my-bookings",
  menuLabel: "Mina bokningar",
  index: 3,
};
export default function Bookingstatus() {
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
        setError("Du har inga bookingar just nu.");
        setBookings([]);
        return;
      }
      const data = (await res.json()) as Booking[];
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError("Du har inga bookingar just nu.");
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
    const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });

  function statusLabel(b: Booking): string {
    if (b.booking_status === "cancelled") return "Avbokad";
    if (b.booking_status === "reserved")  return "Reserverad";
    return "Bekräftad";
  }

  function statusClass(b: Booking): string {
    if (b.booking_status === "cancelled") return "my-bookings__pill my-bookings__pill--cancelled";
    if (b.booking_status === "reserved")  return "my-bookings__pill my-bookings__pill--reserved";
    return "my-bookings__pill my-bookings__pill--confirmed";
  }

  function BookingRow({ booking }: { booking: Booking }) {
    const showCancel =
      booking.booking_status === "confirmed" || booking.booking_status === "reserved";
