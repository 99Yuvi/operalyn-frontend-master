import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getPublicSettings } from '@/api/admin'
import { payForMilestone } from '@/lib/payments'
import PaymentGatewayPicker from '@/components/shared/PaymentGatewayPicker'

/**
 * Pay for a milestone, asking which gateway to use when more than one is available.
 * Render `pickerEl` somewhere in the component that calls `pay`.
 */
export function usePayForMilestone() {
  const qc = useQueryClient()
  const [picker, setPicker] = useState(null) // { gateways, resolve } while the chooser is open

  const pay = useCallback(async (milestoneId, title) => {
    const settings = await qc.fetchQuery({
      queryKey: ['settings', 'public'],
      queryFn:  getPublicSettings,
      staleTime: 60_000,
    })
    const gateways = settings?.data?.payment_gateways ?? []

    if (gateways.length === 0) throw new Error('Payments are not available right now.')

    const gateway = gateways.length === 1
      ? gateways[0]
      : await new Promise((resolve) => setPicker({ gateways, resolve }))

    if (!gateway) throw new Error('Payment cancelled.')

    return payForMilestone(milestoneId, title, gateway)
  }, [qc])

  const close = (gateway) => {
    picker?.resolve(gateway)
    setPicker(null)
  }

  const pickerEl = picker && (
    <PaymentGatewayPicker
      gateways={picker.gateways}
      onSelect={close}
      onClose={() => close(null)}
    />
  )

  return { pay, pickerEl }
}
