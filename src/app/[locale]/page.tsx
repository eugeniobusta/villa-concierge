import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  ChefHat,
  Dumbbell,
  ShoppingCart,
  Sparkles,
  Car,
  Map,
  Flower2,
  Wine,
  Baby,
  Waves,
  Sun,
} from "lucide-react";

const services = [
  {
    icon: ChefHat,
    label: "Private Chef",
    description: "Gourmet meals at your villa",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Sparkles,
    label: "Housekeeping",
    description: "Daily cleaning & tidying",
    color: "bg-sky-50 text-sky-700",
  },
  {
    icon: ShoppingCart,
    label: "Grocery Shopping",
    description: "Fresh produce delivered",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Dumbbell,
    label: "Yoga & Fitness",
    description: "Personal trainer & yoga",
    color: "bg-violet-50 text-violet-700",
  },
  {
    icon: Flower2,
    label: "Massage & Beauty",
    description: "Spa services at your door",
    color: "bg-pink-50 text-pink-700",
  },
  {
    icon: Car,
    label: "Private Transfer",
    description: "Airport & city rides",
    color: "bg-slate-50 text-slate-700",
  },
  {
    icon: Map,
    label: "Malaga Tours",
    description: "Local guides & experiences",
    color: "bg-orange-50 text-orange-700",
  },
  {
    icon: Wine,
    label: "Wine & Beverages",
    description: "Curated selection delivered",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: Baby,
    label: "Childcare",
    description: "Trusted babysitters",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    icon: Waves,
    label: "Laundry",
    description: "Washing, drying & ironing",
    color: "bg-teal-50 text-teal-700",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Sun className="h-4 w-4 text-amber-600" />
            </div>
            <span className="font-semibold text-stone-800 tracking-wide text-sm">
              Villa Concierge
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/60 to-stone-100" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <Badge
            variant="secondary"
            className="mb-5 bg-amber-100 text-amber-800 border-amber-200 text-xs tracking-wider uppercase"
          >
            Private Concierge · Malaga
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 mb-5 tracking-tight leading-tight">
            Everything you need,
            <br />
            <span className="text-amber-700">at your villa.</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Book private chefs, massages, grocery runs, and more — curated
            services available exclusively for guests of your Malaga villa.
          </p>
          <Separator className="max-w-xs mx-auto mb-8 bg-stone-200" />
          <p className="text-sm text-stone-400">
            Your host has shared a private link with you.
            <br />
            Use that link to access and book services during your stay.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest text-center mb-8">
          Available Services
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {services.map(({ icon: Icon, label, description, color }) => (
            <Card
              key={label}
              className="border-stone-200 bg-white hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-medium text-stone-800 text-sm leading-tight">
                  {label}
                </p>
                <p className="text-xs text-stone-400 mt-1 leading-tight">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 text-center">
        <p className="text-xs text-stone-300">
          Private platform · Villa Concierge Malaga
        </p>
      </footer>
    </div>
  );
}
