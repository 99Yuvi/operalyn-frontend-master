import { CreditCard, X } from 'lucide-react'

const GATEWAY_INFO = {
  razorpay: { label: 'Razorpay',  hint: 'UPI, cards, netbanking, wallets' },
  cashfree: { label: 'Cashfree',  hint: 'UPI, cards, netbanking, wallets' },
}

/** Modal that asks the client which payment method to use. Only shown when more than one is available. */
export default function PaymentGatewayPicker({ gateways, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a payment method"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="!m-0 text-base font-semibold text-slate-800">Pay with</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {gateways.map((g) => {
            const info = GATEWAY_INFO[g] ?? { label: g, hint: '' }
            return (
              <button
                key={g}
                type="button"
                onClick={() => onSelect(g)}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-start transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                <CreditCard className="h-5 w-5 shrink-0 text-slate-500" />
                <span>
                  <span className="block text-sm font-medium text-slate-800">{info.label}</span>
                  {info.hint && <span className="block text-xs text-slate-500">{info.hint}</span>}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
