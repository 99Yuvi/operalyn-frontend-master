import PolicyPage, { COMPANY } from './PolicyPage'

const SECTIONS = [
  {
    title: '1. Scope of this Agreement',
    body: `This Client Agreement ("Agreement") applies to every user registered on the Operalyn platform as a Client, and supplements our Terms of Service. By registering as a Client, you accept this Agreement. If there is a conflict between this Agreement and the Terms of Service, this Agreement prevails for Client-specific matters.`,
  },
  {
    title: '2. Relationship of the Parties',
    body: `Freelancers on the Platform are independent contractors, not employees or agents of Operalyn or of you. Operalyn provides the marketplace, escrow, and tools — it is not a party to the service contract between you and a Freelancer and does not supervise, direct, or control a Freelancer's work.`,
  },
  {
    title: '3. Posting Projects',
    body: `You agree that every project you post:
• Accurately describes the work, budget range, and timeline
• Does not request anything unlawful, infringing, or in violation of the Terms of Service
• Is posted with the genuine intent to hire

Posting projects is free. Operalyn may remove postings that violate these rules.`,
  },
  {
    title: '4. Hiring & Contracts',
    body: `When you accept a Freelancer's proposal, a milestone-based contract is created on the Platform. You and the Freelancer agree on deliverables and amounts per milestone before work begins. You agree to:

• Fund each milestone before expecting work on it to begin
• Review delivered work promptly and respond within a reasonable time
• Communicate with the Freelancer through the Platform
• Use the revision-request feature for work that does not match the agreed milestone description, before approving or disputing`,
  },
  {
    title: '5. Payments & Escrow',
    body: `Milestone payments are charged in full to your chosen payment method via Razorpay and held in escrow by Operalyn. Funds are released to the Freelancer only when you approve the milestone. Approval is final — review delivered work carefully before approving.

You pay exactly the agreed milestone amounts. Operalyn's commission is deducted from the Freelancer's side; there is no additional platform fee for Clients.`,
  },
  {
    title: '6. Refunds & Cancellations',
    body: `Funded but undelivered milestones can be cancelled and refunded as per our Cancellation Policy and Refund Policy. In dispute cases, Operalyn reviews the contract history, deliveries, and communication on the Platform and may approve a full refund, a partial refund, or release of payment to the Freelancer.`,
  },
  {
    title: '7. Non-Circumvention',
    body: `You agree not to take Freelancers introduced to you through the Platform off-platform to avoid commission, during your use of the Platform and for 12 months after your last contract with the relevant Freelancer. Circumvention is grounds for account termination.`,
  },
  {
    title: '8. Intellectual Property in Deliverables',
    body: `Unless agreed otherwise in writing with the Freelancer, upon full payment of a milestone, the intellectual property rights in the deliverables for that milestone are assigned to you. Pre-existing tools and know-how of the Freelancer embedded in the deliverables are licensed to you for use as part of the deliverables.`,
  },
  {
    title: '9. Your Responsibilities',
    body: `You are responsible for:
• Evaluating a Freelancer's suitability before hiring (profiles are self-reported; verification confirms identity, not skill)
• The legality of the work you commission and the use of the deliverables
• Keeping your account credentials secure
• Any applicable taxes on your transactions`,
  },
  {
    title: '10. Termination',
    body: `You may stop using the Platform at any time. Contracts in progress should be completed or cancelled per the Cancellation Policy before closing your account. Operalyn may suspend or terminate your account for violations of this Agreement or the Terms of Service. Escrowed amounts for undelivered work are handled per the Refund Policy.

For questions about this Agreement, contact ${COMPANY.email}.`,
  },
]

export default function ClientAgreement() {
  return (
    <PolicyPage
      title="Client Agreement"
      intro="This agreement sets out the terms that apply to Clients hiring Freelancers on Operalyn — covering project posting, contracts, escrow payments, refunds, and intellectual property."
      sections={SECTIONS}
      related={[
        ['Freelancer Agreement', '/freelancer-agreement'],
        ['Terms of Service', '/terms'],
        ['Refund Policy', '/refund-policy'],
        ['Cancellation Policy', '/cancellation-policy'],
      ]}
    />
  )
}
