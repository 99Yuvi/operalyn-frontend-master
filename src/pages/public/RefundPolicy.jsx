import PolicyPage, { COMPANY } from './PolicyPage'

const SECTIONS = [
  {
    title: '1. Overview',
    body: `This Refund Policy explains how refunds work on the Operalyn platform. Operalyn is a milestone-based freelance marketplace: Clients fund milestones in advance, the amount is held in escrow by Operalyn, and it is released to the Freelancer only after the Client approves the completed work. This escrow model is designed to protect both parties and minimise refund disputes.

All payments are processed in Indian Rupees (INR) through Razorpay, a PCI-DSS compliant third-party payment gateway.`,
  },
  {
    title: '2. When You Are Eligible for a Refund',
    body: `A Client is eligible for a refund of an escrowed milestone payment in the following cases:

• The Freelancer fails to deliver the milestone within the agreed timeline and does not respond to communication for 7 or more days
• The Freelancer explicitly abandons or declines to complete the contract after the milestone was funded
• Both the Client and the Freelancer mutually agree to cancel the milestone before delivery
• The contract is cancelled under our Cancellation Policy before the milestone work has started
• A duplicate or erroneous payment was made for the same milestone`,
  },
  {
    title: '3. When Refunds Are Not Available',
    body: `Refunds are not available in the following cases:

• The milestone has already been approved by the Client — approval releases payment to the Freelancer and is final
• Work has been delivered as per the agreed milestone description, and the Client's dissatisfaction is subjective in nature (Clients should use the revision-request feature before approving)
• The refund request relates to work or payments made outside the Platform
• The Operalyn platform commission on already-completed and approved milestones`,
  },
  {
    title: '4. How to Request a Refund',
    body: `To request a refund:

1. Go to the relevant contract on the Platform and raise the issue with the Freelancer first using the built-in chat — most issues are resolved directly.
2. If unresolved, email us at ${COMPANY.email} with your contract ID, milestone details, and the reason for the refund request.
3. Our team will review the request, examine the contract history, deliveries, and communication on the Platform, and respond within 5–7 business days.`,
  },
  {
    title: '5. Refund Processing Time',
    body: `Once a refund is approved:

• The refund is initiated to the original payment method via Razorpay within 3–5 business days of approval
• Depending on your bank or card issuer, the amount may take an additional 5–10 business days to reflect in your account
• You will receive an email confirmation when the refund is initiated

Refunds are always made to the original payment method used for the transaction. Refunds cannot be transferred to a different account, card, or wallet.`,
  },
  {
    title: '6. Partial Refunds',
    body: `In dispute cases where some work has been delivered but the milestone was not fully completed, Operalyn may, after reviewing evidence from both parties, approve a partial refund — splitting the escrowed amount between the Client and the Freelancer in proportion to the work completed. Operalyn's assessment in such cases is made in good faith based on the material available on the Platform.`,
  },
  {
    title: '7. Chargebacks',
    body: `If you initiate a chargeback with your bank or card issuer instead of following this Refund Policy, your account may be suspended pending investigation. We encourage you to contact us first — genuine refund requests are honoured under this policy without the need for a chargeback.`,
  },
  {
    title: '8. Contact Us',
    body: `For any questions about this Refund Policy or the status of a refund, contact us at:

${COMPANY.name}
${COMPANY.address}
Email: ${COMPANY.email}`,
  },
]

export default function RefundPolicy() {
  return (
    <PolicyPage
      title="Refund Policy"
      intro="This policy describes when and how payments made on Operalyn are refunded. Because milestone payments are held in escrow until you approve the work, most payment issues can be resolved without needing a refund."
      sections={SECTIONS}
      related={[
        ['Cancellation Policy', '/cancellation-policy'],
        ['Terms of Service', '/terms'],
        ['Pricing', '/pricing'],
        ['Contact Us', '/contact'],
      ]}
    />
  )
}
