import { payMilestone, verifyMilestonePayment } from '@/api/contracts'

/** Load a third-party checkout script once. Resolves false if it can't be loaded. */
function loadScript(src, isReady) {
  return new Promise((resolve) => {
    if (isReady()) { resolve(true); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

async function payWithRazorpay(milestoneId, title, order) {
  const ready = await loadScript('https://checkout.razorpay.com/v1/checkout.js', () => !!window.Razorpay)
  if (!ready) throw new Error('Payment service unavailable. Try again.')

  await new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key:         order.key_id,
      amount:      order.amount_paise,
      currency:    order.currency ?? 'INR',
      order_id:    order.order_id,
      name:        'Operalyn',
      description: title,
      handler: async (response) => {
        try {
          await verifyMilestonePayment(milestoneId, {
            order_id:   response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature:  response.razorpay_signature,
          })
          resolve()
        } catch (err) {
          // The money was taken; the webhook will still confirm it shortly
          reject(new Error(err?.message ?? 'Payment received. It may take a minute to show up.'))
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
      theme: { color: '#334155' },
    })
    rzp.open()
  })
}

async function payWithCashfree(milestoneId, order) {
  const ready = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js', () => !!window.Cashfree)
  if (!ready) throw new Error('Payment service unavailable. Try again.')

  const cashfree = window.Cashfree({ mode: order.mode })
  const result = await cashfree.checkout({
    paymentSessionId: order.payment_session_id,
    redirectTarget: '_modal',
  })

  if (result?.error) throw new Error(result.error.message ?? 'Payment cancelled.')

  // Never trust the browser's word for it — the backend asks Cashfree whether it was really paid
  await verifyMilestonePayment(milestoneId, { order_id: order.order_id })
}

/**
 * CCAvenue is a redirect gateway: the browser POSTs an encrypted request to their hosted page,
 * and they send it back to the backend (then on to the contract page) when done.
 * The page unloads, so this deliberately never resolves.
 */
function payWithCcavenue(order) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = order.action_url

  for (const [name, value] of [['encRequest', order.enc_request], ['access_code', order.access_code]]) {
    const input = document.createElement('input')
    input.type  = 'hidden'
    input.name  = name
    input.value = value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()

  return new Promise(() => {})
}

/**
 * Pay for a milestone with the chosen gateway: create the order, open its checkout,
 * then confirm with the backend. Resolves once the payment is confirmed; rejects with an
 * Error whose message is safe to show.
 */
export async function payForMilestone(milestoneId, title, gateway) {
  const res = await payMilestone(milestoneId, gateway)
  const order = res?.data

  if (order.gateway === 'cashfree') return payWithCashfree(milestoneId, order)
  if (order.gateway === 'ccavenue') return payWithCcavenue(order)
  return payWithRazorpay(milestoneId, title, order)
}
