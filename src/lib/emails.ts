import { Resend } from "resend";
import { getAppUrl } from "./app-url";

// Prevent user-supplied strings from breaking email HTML structure
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Fire-and-forget wrapper: logs on failure, never throws.
// Booking actions must not fail just because an email didn't send.
// The Resend client is instantiated here (not at module level) so a missing
// API key during build/static analysis doesn't crash the process.
async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM   = process.env.RESEND_FROM_EMAIL ?? "Sanchamar <concierge@sanchamar.com>";
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Failed to deliver to", to, err);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── Base template (inline-styled for email client compatibility) ──────────────
function layout(headline: string, bodyHtml: string, ctaUrl: string, ctaText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr>
    <td style="background:#0e1826;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:3px;color:#c4940a;">SANCHAMAR</p>
      <p style="margin:6px 0 0;font-size:11px;color:rgba(196,148,10,0.55);letter-spacing:2px;text-transform:uppercase;">Private Villa Concierge · Malaga</p>
    </td>
  </tr>
  <tr>
    <td style="background:#ffffff;padding:32px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0e1826;">${headline}</h1>
      ${bodyHtml}
    </td>
  </tr>
  <tr>
    <td style="background:#ffffff;padding:0 32px 32px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;text-align:center;">
      <a href="${ctaUrl}" style="display:inline-block;background:#c4940a;color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">${ctaText}</a>
    </td>
  </tr>
  <tr>
    <td style="background:#f8f8f9;border:1px solid #e4e4e7;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#71717a;">Sanchamar · Villa Concierge Malaga<br>Questions? Reply to this email and we'll get back to you.</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function detailsTable(
  serviceName: string,
  bookingDate: string,
  startTime: string | null,
  totalAmount: number,
) {
  const timeRow = startTime
    ? `<tr><td style="padding:6px 0;color:#71717a;font-size:13px;width:50%;">Time</td><td style="padding:6px 0;font-weight:600;color:#0e1826;font-size:13px;text-align:right;">${startTime.slice(0, 5)}</td></tr>`
    : "";
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f9;border:1px solid #e4e4e7;border-radius:10px;margin:20px 0;">
<tr><td style="padding:16px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:6px 0;color:#71717a;font-size:13px;width:50%;">Service</td><td style="padding:6px 0;font-weight:600;color:#0e1826;font-size:13px;text-align:right;">${esc(serviceName)}</td></tr>
    <tr><td style="padding:6px 0;color:#71717a;font-size:13px;">Date</td><td style="padding:6px 0;font-weight:600;color:#0e1826;font-size:13px;text-align:right;">${fmtDate(bookingDate)}</td></tr>
    ${timeRow}
    <tr><td style="border-top:1px solid #e4e4e7;padding:10px 0 4px;color:#71717a;font-size:13px;">Total</td><td style="border-top:1px solid #e4e4e7;padding:10px 0 4px;font-weight:700;color:#c4940a;font-size:15px;text-align:right;">€${totalAmount.toFixed(2)}</td></tr>
  </table>
</td></tr>
</table>`;
}

// ── Public send functions ──────────────────────────────────────────────────────

export interface BookingEmailData {
  guestName:   string;
  guestEmail:  string;
  serviceName: string;
  bookingDate: string;
  startTime:   string | null;
  totalAmount: number;
  accessToken: string;
}

/** Sent to the guest immediately when they submit a booking. */
export async function sendBookingReceivedEmail(data: BookingEmailData) {
  const url  = `${getAppUrl()}/en/stay/${data.accessToken}/bookings`;
  const body = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:0;">
      Hi <strong>${esc(data.guestName)}</strong>, we've received your booking request.
      Our team will review it and confirm shortly.
    </p>
    ${detailsTable(data.serviceName, data.bookingDate, data.startTime, data.totalAmount)}`;

  await send(
    data.guestEmail,
    `Booking received — ${esc(data.serviceName)}`,
    layout("Booking Received", body, url, "View my bookings →"),
  );
}

/** Sent to the guest when their booking is marked confirmed (admin or Stripe). */
export async function sendBookingConfirmedEmail(data: BookingEmailData) {
  const url  = `${getAppUrl()}/en/stay/${data.accessToken}/bookings`;
  const body = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:0;">
      Great news, <strong>${esc(data.guestName)}</strong>!
      Your booking is confirmed — everything is arranged. See you in Malaga.
    </p>
    ${detailsTable(data.serviceName, data.bookingDate, data.startTime, data.totalAmount)}`;

  await send(
    data.guestEmail,
    `Confirmed — ${esc(data.serviceName)}`,
    layout("Booking Confirmed", body, url, "View booking details →"),
  );
}

/** Sent to the guest when a provider accepts their request — prompts them to pay. */
export async function sendBookingAcceptedEmail(data: BookingEmailData) {
  const url  = `${getAppUrl()}/en/stay/${data.accessToken}/bookings`;
  const body = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:0;">
      Good news, <strong>${esc(data.guestName)}</strong>! The provider has accepted your request.
      Complete your payment now to secure the booking.
    </p>
    ${detailsTable(data.serviceName, data.bookingDate, data.startTime, data.totalAmount)}`;

  await send(
    data.guestEmail,
    `Accepted — pay now to confirm your ${esc(data.serviceName)}`,
    layout("Booking Accepted", body, url, "Pay now →"),
  );
}

/** Sent to the guest when a provider declines their request. */
export async function sendBookingDeclinedEmail(data: BookingEmailData) {
  const url  = `${getAppUrl()}/en/stay/${data.accessToken}`;
  const body = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:0;">
      Hi <strong>${esc(data.guestName)}</strong>, unfortunately the provider is not available for
      your <strong>${esc(data.serviceName)}</strong> request. You have not been charged.
      Please browse our other services or contact your host for alternatives.
    </p>
    ${detailsTable(data.serviceName, data.bookingDate, data.startTime, data.totalAmount)}`;

  await send(
    data.guestEmail,
    `Booking unavailable — ${esc(data.serviceName)}`,
    layout("Booking Declined", body, url, "Browse services →"),
  );
}

/** Sent to every admin email when a new booking comes in. */
export async function sendAdminNewBookingEmail({
  guestName,
  serviceName,
  bookingDate,
  startTime,
  totalAmount,
}: {
  guestName:   string;
  serviceName: string;
  bookingDate: string;
  startTime:   string | null;
  totalAmount: number;
}) {
  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!adminEmails.length) return;

  const url  = `${getAppUrl()}/en/admin/bookings`;
  const body = `
    <p style="color:#52525b;font-size:14px;line-height:1.6;margin:0;">
      <strong>${esc(guestName)}</strong> just submitted a new booking request.
    </p>
    ${detailsTable(serviceName, bookingDate, startTime, totalAmount)}`;

  for (const to of adminEmails) {
    await send(
      to,
      `New booking — ${esc(guestName)} · ${esc(serviceName)}`,
      layout("New Booking Request", body, url, "Review in admin →"),
    );
  }
}
