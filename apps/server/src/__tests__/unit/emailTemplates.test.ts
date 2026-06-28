import { renderEmailTemplate } from '../../utils/emailTemplates'

describe('renderEmailTemplate', () => {
  it('uses event-specific copy for known events', () => {
    const { subject, html } = renderEmailTemplate({
      event: 'payment.received',
      title: 'Payment captured',
      message: 'Payment received for booking DR-1',
      data: { bookingId: 'DR-1' },
    })

    expect(subject).toContain('Payment receipt')
    expect(html).toContain('dailyRojgar')
    expect(html).toContain('Payment received for booking DR-1')
    expect(html).toContain('DR-1')
  })

  it('falls back to title/message for events without custom copy', () => {
    const { subject, html } = renderEmailTemplate({
      event: 'system.notification',
      title: 'Heads up',
      message: 'Something happened',
    })

    expect(subject).toContain('Heads up')
    expect(html).toContain('Something happened')
  })

  it('escapes HTML to prevent injection', () => {
    const { html } = renderEmailTemplate({
      event: 'system.notification',
      title: 'Hi',
      message: '<script>alert(1)</script>',
    })

    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
