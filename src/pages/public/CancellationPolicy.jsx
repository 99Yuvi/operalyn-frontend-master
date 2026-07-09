import PolicyPage, { COMPANY } from './PolicyPage'

const SECTIONS = [
  {
    title: '1. Overview',
    body: `This Cancellation Policy explains how projects, contracts, and milestones can be cancelled on the Operalyn platform, and what happens to funded amounts when a cancellation occurs. Refunds resulting from cancellations are governed by our Refund Policy.`,
  },
  {
    title: '2. Cancelling a Project Posting',
    body: `Clients may edit or delete a project posting at any time before accepting a proposal, at no cost. Once a proposal has been accepted and a contract is created, the project can no longer be cancelled by deleting the posting — the contract cancellation rules below apply instead.`,
  },
  {
    title: '3. Cancelling a Proposal',
    body: `Freelancers may withdraw a submitted proposal at any time before it is accepted by the Client, at no cost and with no penalty. Once a proposal is accepted and a contract is created, withdrawal is treated as a contract cancellation.`,
  },
  {
    title: '4. Cancelling a Contract — Before Work Starts',
    body: `A contract (or an individual milestone) may be cancelled before work on it has started:

• By mutual agreement — either party can propose cancellation through the Platform chat; if both parties agree, contact us and the milestone is cancelled
• Any funded but unstarted milestone amount held in escrow is refunded to the Client in full, as per the Refund Policy
• Milestones that have already been completed and approved are not affected by the cancellation and remain paid`,
  },
  {
    title: '5. Cancelling a Contract — After Work Starts',
    body: `If work on a milestone has already started:

• The parties should first attempt to agree on a fair outcome — completing the current milestone before cancelling, or agreeing on a partial payment for work done
• If no agreement is reached, either party may email ${COMPANY.email} with the contract ID. Operalyn will review the deliveries and communication on the Platform and may approve a full refund, a partial refund, or release of payment, in line with the Refund Policy
• Repeated cancellations of in-progress contracts without reasonable cause may affect the cancelling party's standing on the Platform`,
  },
  {
    title: '6. Cancellation by the Freelancer',
    body: `A Freelancer may decline to continue a contract by informing the Client on the Platform. In that case:

• All funded but undelivered milestone amounts are refunded to the Client
• Milestones already approved remain paid
• Freelancers who repeatedly abandon active contracts may have their verification badge or account suspended`,
  },
  {
    title: '7. Cancellation by Operalyn',
    body: `Operalyn reserves the right to cancel a contract and refund escrowed amounts when:

• The project or contract violates our Terms of Service or applicable law
• Fraudulent activity or payment abuse is detected
• A party's account is terminated for violations

In such cases, escrowed amounts for undelivered work are returned to the Client, and legitimately completed and approved work remains paid to the Freelancer.`,
  },
  {
    title: '8. Subscription & Fees',
    body: `Operalyn does not charge Clients or Freelancers any subscription, listing, or membership fee, so there is no recurring charge to cancel. The platform commission applies only to successfully completed milestones and is not charged on cancelled milestones.`,
  },
  {
    title: '9. Contact Us',
    body: `For cancellation requests or questions about this policy, contact us at:

${COMPANY.name}
${COMPANY.address}
Email: ${COMPANY.email}`,
  },
]

export default function CancellationPolicy() {
  return (
    <PolicyPage
      title="Cancellation Policy"
      intro="Projects, proposals, and contracts on Operalyn can be cancelled as described below. Escrow protects both sides: unstarted work is refunded, and completed, approved work stays paid."
      sections={SECTIONS}
      related={[
        ['Refund Policy', '/refund-policy'],
        ['Terms of Service', '/terms'],
        ['Contact Us', '/contact'],
      ]}
    />
  )
}
