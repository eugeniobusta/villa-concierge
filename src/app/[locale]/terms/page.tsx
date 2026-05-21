import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Sanchamar",
  robots: { index: true, follow: false },
};

export default async function TermsPage({
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

      <h1 className="text-3xl font-semibold text-foreground mb-2">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-10">
        Last updated: May 2026 · Sanchamar Gestión de Activos Inmobiliarios
      </p>

      <div className="space-y-8 text-foreground">

        <section>
          <h2 className="text-lg font-semibold mb-3">1. About this service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Sanchamar (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a private concierge platform that allows
            guests of partnered villas in Malaga, Spain to book curated services (chef,
            massage, transfers, and more) through independent service providers.
            By using this platform you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. Access</h2>
          <p className="text-muted-foreground leading-relaxed">
            Access to the guest portal is granted via a unique link issued by your host for
            the duration of your stay. This link is personal and must not be shared. It expires
            automatically at check-out.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Bookings</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>Submitting a booking request is not a confirmed reservation. Your card will be
              <strong className="text-foreground"> authorised (held)</strong> but not charged until the
              service provider confirms availability.</li>
            <li>If the provider declines, the authorisation is released immediately and you are
              not charged.</li>
            <li>Once confirmed, the held amount is captured. You will receive a confirmation email.</li>
            <li>Prices displayed are inclusive of all fees. No hidden charges.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Cancellations &amp; refunds</h2>
          <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
            <li>You may cancel a <strong className="text-foreground">pending</strong> booking
              (awaiting provider confirmation) at any time — the card hold is released immediately.</li>
            <li>You may cancel a <strong className="text-foreground">confirmed and paid</strong> booking
              before the service date — a full refund will be issued to your original payment method.
              Allow 5–10 business days for the refund to appear.</li>
            <li>Cancellations after the service has started or been completed are not eligible for a refund.</li>
            <li>For disputes, contact us at{" "}
              <a href="mailto:concierge@sanchamar.com" className="text-primary hover:underline">
                concierge@sanchamar.com
              </a>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            All payments are processed securely by{" "}
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Stripe
            </a>. We never see or store your card details. By making a payment you also
            agree to{" "}
            <a href="https://stripe.com/legal/consumer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Stripe&apos;s consumer terms
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Provider relationship</h2>
          <p className="text-muted-foreground leading-relaxed">
            Service providers are independent professionals, not employees of Sanchamar.
            We facilitate the booking and payment, but the service itself is delivered by
            the provider. Any specific requirements or concerns about the service should
            be communicated through the booking notes or directly with your host.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Sanchamar acts as an intermediary platform. We are not liable for the quality,
            safety, or outcome of services delivered by third-party providers. Our total
            liability to you for any claim arising from use of this platform is limited to
            the amount paid for the specific booking in dispute.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Acceptable use</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to abuse the platform, submit fraudulent booking requests, share
            your access link publicly, or attempt to reverse-engineer any part of the service.
            We reserve the right to revoke access for violations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">9. Governing law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These terms are governed by the laws of Spain. Any disputes shall be subject to
            the exclusive jurisdiction of the courts of Malaga, Spain.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">10. Changes</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms from time to time. Continued use of the platform
            after changes are posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">11. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these terms:{" "}
            <a href="mailto:concierge@sanchamar.com" className="text-primary hover:underline">
              concierge@sanchamar.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-border flex items-center gap-4">
        <Link href={`/${locale}/privacy`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
        <span className="text-muted-foreground/30 text-xs">·</span>
        <p className="text-xs text-muted-foreground">
          Sanchamar · Malaga, Spain
        </p>
      </div>
    </div>
  );
}
