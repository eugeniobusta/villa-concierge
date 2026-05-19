"use client";

import { SpotlightTour } from "@/components/tour/SpotlightTour";

const STEPS = [
  {
    title: "Welcome!",
    body:  "Your villa services are ready. Here's how to book anything in a few taps.",
  },
  {
    target: "services-grid",
    title:  "Browse your services",
    body:   "Tap any card to book — private chef, massage, transfers, yoga and more. Takes under a minute.",
  },
  {
    target: "my-bookings-banner",
    title:  "Your bookings",
    body:   "All your confirmed bookings and payments live here. Tap anytime to check or cancel.",
  },
];

export function GuestTour({ guestName }: { guestName: string }) {
  return (
    <SpotlightTour
      steps={STEPS}
      storageKey="sanchamar_tour_guest_v1"
      name={guestName.split(" ")[0]}
    />
  );
}
