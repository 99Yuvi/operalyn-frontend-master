import { useQuery } from '@tanstack/react-query'
import { getPublicSettings } from '@/api/admin'
import PolicyPage, { C, COMPANY } from './PolicyPage'

export default function Pricing() {
  const { data: settingsData } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn:  getPublicSettings,
    staleTime: 5 * 60 * 1000,
  })
  const rate = settingsData?.data?.commission_rate ?? '12'

  const FEES = [
    ['Creating an account (Client or Freelancer)',      'Free'],
    ['Posting a project',                               'Free'],
    ['Submitting proposals',                            'Free'],
    ['Chat, file sharing & contract management',        'Free'],
    ['Monthly subscription / membership',               'None'],
    [`Platform commission on completed milestones`,     `${rate}% (deducted from Freelancer payout)`],
    ['Payment processing',                              'Included — no extra charge to users'],
    ['Withdrawal / payout to bank or UPI',              'Free'],
  ]

  const SECTIONS = [
    {
      title: 'How the commission works',
      body: `Operalyn charges a single success-based commission of ${rate}% on completed milestones — nothing else.

1. The Client funds a milestone for the full agreed amount (e.g. ₹10,000).
2. The amount is held safely in escrow while the Freelancer works.
3. When the Client approves the delivered work, Operalyn deducts its ${rate}% commission (₹${(10000 * Number(rate) / 100).toLocaleString('en-IN')} in this example) and credits the balance (₹${(10000 - 10000 * Number(rate) / 100).toLocaleString('en-IN')}) to the Freelancer's earnings, available for payout to their bank account or UPI.

If a milestone is cancelled or refunded, no commission is charged.`,
    },
    {
      title: 'What Clients pay',
      body: `Clients pay exactly the milestone amounts they agree with the Freelancer — no platform fee, no processing fee, no subscription. All payments are processed securely in INR via Razorpay.`,
    },
    {
      title: 'What Freelancers pay',
      body: `Freelancers pay the ${rate}% commission only when a milestone is completed and approved. There is no cost to create a profile, get verified, submit proposals, or withdraw earnings. If you don't earn, you don't pay.`,
    },
    {
      title: 'Taxes',
      body: `Amounts shown on the Platform are exclusive of any applicable taxes. Users are responsible for their own tax obligations (including GST and income tax, where applicable) on amounts earned or paid through the Platform.`,
    },
    {
      title: 'Changes to pricing',
      body: `The commission rate may be revised with prior notice on the Platform. A revised rate applies only to milestones funded after the change — already-funded milestones keep the rate that applied when they were funded.

For pricing questions, contact us at ${COMPANY.email}.`,
    },
  ]

  return (
    <PolicyPage
      label="Pricing"
      title="Simple, success-based pricing"
      intro={`No setup fee. No subscription. No hidden charges. You pay a ${rate}% commission only when work is successfully completed — everything else on Operalyn is free.`}
      sections={SECTIONS}
      related={[
        ['Terms of Service', '/terms'],
        ['Refund Policy', '/refund-policy'],
        ['Contact Us', '/contact'],
      ]}
    >
      {/* Fee table */}
      <div style={{ marginTop: 48, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: C.ground2, borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Complete fee schedule</p>
        </div>
        {FEES.map(([item, fee], i) => (
          <div key={item} style={{
            display: 'flex', justifyContent: 'space-between', gap: 16, padding: '13px 20px',
            borderBottom: i < FEES.length - 1 ? `1px solid ${C.border}` : 'none', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 14, color: C.muted }}>{item}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: fee.startsWith('Free') || fee === 'None' ? '#16A34A' : C.text }}>{fee}</span>
          </div>
        ))}
      </div>
    </PolicyPage>
  )
}
