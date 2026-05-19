"use client";

import { SpotlightTour } from "@/components/tour/SpotlightTour";

const STEPS = [
  {
    title: "Welcome to your portal!",
    body:  "Manage your bookings and availability from here. It only takes a moment to get set up.",
  },
  {
    target: "availability-nav",
    title:  "Set your availability first",
    body:   "Add the time slots when you're available — guests can only book you when you've opened slots.",
  },
  {
    target: "bookings-nav",
    title:  "Your confirmed bookings",
    body:   "All bookings, earnings and guest requests appear here in real time.",
  },
];

export function ProviderTour({ providerName }: { providerName: string }) {
  return (
    <SpotlightTour
      steps={STEPS}
      storageKey="sanchamar_tour_provider_v1"
      name={providerName.split(" ")[0]}
    />
  );
}
