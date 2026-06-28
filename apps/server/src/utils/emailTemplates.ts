import type { NotificationEvent } from '../services/notification.service'

const BRAND = 'dailyRojgar'
const ACCENT = '#16a34a'

interface TemplateInput {
  event: NotificationEvent
  title: string
  message: string
  data?: Record<string, unknown>
}

/** Per-event heading + intro, falling back to the generic title/message. */
const EVENT_COPY: Partial<Record<NotificationEvent, { heading: string; intro: string }>> = {
  'booking.created': {
    heading: 'New booking request',
    intro: 'You have a new booking request. Review the details and respond from your dashboard.',
  },
  'booking.accepted': {
    heading: 'Your booking is confirmed',
    intro: 'Good news — the worker accepted your booking. Here are the details.',
  },
  'booking.rejected': {
    heading: 'Booking declined',
    intro: 'Unfortunately the worker could not take this booking. You can find another worker.',
  },
  'job.completed': {
    heading: 'Job completed',
    intro: 'This job has been marked complete. You can now leave a review.',
  },
  'payment.received': {
    heading: 'Payment receipt',
    intro: 'We received your payment. Thank you — your booking is fully confirmed.',
  },
  'worker.approved': {
    heading: 'You are verified',
    intro: 'Your worker profile has been approved. You can now receive bookings.',
  },
  'worker.rejected': {
    heading: 'Verification update',
    intro: 'Your worker verification needs attention. Please review and resubmit.',
  },
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function detailRows(data?: Record<string, unknown>): string {
  if (!data) return ''
  const labels: Record<string, string> = {
    bookingId: 'Booking',
    paymentId: 'Payment',
    status: 'Status',
    refundAmount: 'Refund amount',
  }
  const rows = Object.entries(labels)
    .filter(([key]) => data[key] !== undefined && data[key] !== null)
    .map(
      ([key, label]) =>
        `<tr><td style="padding:4px 0;color:#6b7280;">${label}</td>` +
        `<td style="padding:4px 0;color:#111827;text-align:right;">${escapeHtml(String(data[key]))}</td></tr>`,
    )
    .join('')
  return rows
    ? `<table style="width:100%;font-size:14px;margin-top:16px;border-top:1px solid #e5e7eb;padding-top:8px;">${rows}</table>`
    : ''
}

/** Builds a branded HTML email (and subject) for a notification event. */
export function renderEmailTemplate(input: TemplateInput): { subject: string; html: string } {
  const copy = EVENT_COPY[input.event]
  const heading = copy?.heading ?? input.title
  const intro = copy?.intro ?? input.message
  const subject = `${BRAND} — ${heading}`

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="background:${ACCENT};padding:20px 24px;color:#ffffff;font-size:20px;font-weight:bold;">${BRAND}</td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px;font-size:18px;color:#111827;">${escapeHtml(heading)}</h1>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.5;">${escapeHtml(intro)}</p>
          <p style="margin:16px 0 0;color:#111827;font-size:14px;line-height:1.5;">${escapeHtml(input.message)}</p>
          ${detailRows(input.data)}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background:#f9fafb;color:#9ca3af;font-size:12px;">
          You're receiving this because you have a ${BRAND} account.
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, html }
}
