// Notification hooks. WhatsApp and email sending will be connected once NUPAL shares their
// WhatsApp Business API provider and sending email address. Until then, events are logged.
type BookingEvent = { kind: "booking.created" | "booking.cancelled" | "booking.rescheduled"; number: number; phone: string; email?: string | null; text: string };
type OrderEvent = { kind: "order.created" | "order.status"; number: number; phone: string; email?: string | null; text: string };

export async function notify(e: BookingEvent | OrderEvent) {
  console.info(`[notify] ${e.kind} #${e.number} → +91 ${e.phone}${e.email ? ` / ${e.email}` : ""}: ${e.text}`);
}
