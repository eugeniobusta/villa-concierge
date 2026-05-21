import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Sanchamar",
  robots: { index: true, follow: false },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link
        href={`/${locale}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-semibold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-10">
        Last updated: May 2026 · Sanchamar Gestión de Activos Inmobiliarios
      </p>

      <div className="prose prose-sm max-w-none text-foreground space-y-8">

        <section>
          <h2 className="text-lg font-semibold mb-3">1. Who we are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Sanchamar operates a private villa concierge platform for guests staying in Malaga, Spain.
            We act as the data controller for personal information collected through this website.
            Contact us at <a href="mailto:concierge@sanchamar.com" className="text-primary hover:underline">concierge@sanchamar.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. What data we collect</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-1.5 list-disc list-inside">
            <li><strong className="text-foreground">Guest name and email</strong> — provided by the host when creating your stay</li>
            <li><strong className="text-foreground">Booking details</strong> — service, date, time, special requests, amounts</li>
            <li><strong className="text-foreground">Payment data</strong> — processed exclusively by Stripe; we never see or store your card details</li>
            <li><strong className="text-foreground">Usage data</strong> — standard server logs (IP address, browser type) retained for 30 days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. How we use your data</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-1.5 list-disc list-inside">
            <li>To fulfil bookings and coordinate with service providers</li>
            <li>To send transactional emails about your bookings (via Resend)</li>
            <li>To manage your stay access and security</li>
            <li>We do <strong className="text-foreground">not</strong> sell your data or use it for advertising</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Legal basis (GDPR)</h2>
          <p className="text-muted-foreground leading-relaxed">
            Processing is based on <strong className="text-foreground">contract performance</strong> (Art. 6(1)(b) GDPR) —
            we need your data to fulfil your booking — and <strong className="text-foreground">legitimate interest</strong> (Art. 6(1)(f))
            for security and fraud prevention.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Data sharing</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-1.5 list-disc list-inside">
            <li><strong className="text-foreground">Service providers</strong> — your name and booking details are shared with the assigned provider to fulfil your booking</li>
            <li><strong className="text-foreground">Stripe</strong> — processes payments; <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a></li>
            <li><strong className="text-foreground">Resend</strong> — sends transactional emails; <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Privacy Policy</a></li>
            <li><strong className="text-foreground">Supabase</strong> — hosts our database (EU region); <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Privacy Policy</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Data retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Booking records are retained for <strong className="text-foreground">3 years</strong> for accounting and
            legal compliance. Guest portal access expires at check-out. You may request earlier deletion (see below).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Your rights (GDPR)</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
          <ul className="text-muted-foreground leading-relaxed space-y-1.5 list-disc list-inside">
            <li><strong className="text-foreground">Access</strong> — request a copy of your data</li>
            <li><strong className="text-foreground">Rectification</strong> — correct inaccurate data</li>
            <li><strong className="text-foreground">Erasure</strong> — request deletion of your personal data</li>
            <li><strong className="text-foreground">Portability</strong> — receive your data in a portable format</li>
            <li><strong className="text-foreground">Objection</strong> — object to processing based on legitimate interest</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            To exercise any right, email{" "}
            <a href="mailto:concierge@sanchamar.com" className="text-primary hover:underline">concierge@sanchamar.com</a>.
            We respond within 30 days. You may also lodge a complaint with the{" "}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Spanish Data Protection Agency (AEPD)
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use only essential cookies required for authentication and security (Supabase session cookie).
            No tracking or advertising cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">9. Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            All data is transmitted over HTTPS. Access is controlled by short-lived tokens and
            Supabase row-level security. Card data never touches our servers — it goes directly to Stripe.
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Sanchamar · Malaga, Spain · <a href="mailto:concierge@sanchamar.com" className="hover:text-foreground transition-colors">concierge@sanchamar.com</a>
        </p>
      </div>
    </div>
  );
}
