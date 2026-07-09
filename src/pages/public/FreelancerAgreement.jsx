import PolicyPage, { COMPANY } from './PolicyPage'

const SECTIONS = [
  {
    title: '1. Scope of this Agreement',
    body: `This Freelancer Agreement ("Agreement") applies to every user registered on the Operalyn platform as a Freelancer, and supplements our Terms of Service. By registering as a Freelancer, you accept this Agreement. If there is a conflict between this Agreement and the Terms of Service, this Agreement prevails for Freelancer-specific matters.`,
  },
  {
    title: '2. Independent Contractor Status',
    body: `You provide services to Clients as an independent contractor. Nothing in this Agreement creates an employment, agency, partnership, or joint-venture relationship between you and Operalyn or between you and any Client. You are solely responsible for your own taxes, statutory contributions, insurance, equipment, and business expenses.`,
  },
  {
    title: '3. Profile & Verification',
    body: `You agree to:
• Keep your profile information (skills, experience, portfolio, rates) accurate and up to date
• Submit genuine, unaltered government-issued identity documents for verification
• Not create more than one Freelancer account or misrepresent your identity or qualifications

Providing false information or forged documents will result in permanent account termination.`,
  },
  {
    title: '4. Proposals & Contracts',
    body: `When you submit a proposal, you confirm that you have read the project requirements and can deliver the described work at the quoted amount and timeline. When a Client accepts your proposal, a milestone-based contract is created on the Platform.

You agree to:
• Deliver work that meets the agreed milestone descriptions
• Communicate with the Client through the Platform
• Deliver original work that does not infringe any third party's intellectual property rights
• Respond to Client messages on active contracts within a reasonable time`,
  },
  {
    title: '5. Payments, Commission & Payouts',
    body: `Milestone amounts funded by Clients are held in escrow and released to your earnings balance when the Client approves the delivered work. Operalyn deducts its platform commission (see the Pricing page for the current rate) from each approved milestone before crediting your balance.

Payouts are made to your registered Indian bank account or UPI ID after admin review of your payout request. You are responsible for providing correct payout details — payments sent to details you provided incorrectly cannot be recovered by Operalyn.`,
  },
  {
    title: '6. Revisions & Disputes',
    body: `Clients may request reasonable revisions before approving a milestone if the delivered work does not match the agreed milestone description. If a dispute arises, both parties agree to first attempt resolution through the Platform. Unresolved disputes are handled per the Dispute Resolution section of the Terms of Service, and any resulting refunds per the Refund Policy.`,
  },
  {
    title: '7. Non-Circumvention',
    body: `You agree not to solicit, propose, or accept payment from Clients introduced to you through the Platform outside the Platform, in order to avoid the platform commission. This restriction applies during your use of the Platform and for 12 months after your last contract with the relevant Client. Circumvention is grounds for immediate account termination and forfeiture of pending, unearned benefits.`,
  },
  {
    title: '8. Intellectual Property in Deliverables',
    body: `Unless agreed otherwise in writing with the Client, upon full payment of a milestone, the intellectual property rights in the deliverables for that milestone are assigned to the Client. You retain rights to your pre-existing tools, libraries, and know-how used to create the deliverables, and you grant the Client a licence to use them as embedded in the deliverables.`,
  },
  {
    title: '9. Confidentiality',
    body: `You agree to keep confidential any non-public information shared by a Client for the purpose of a project (business plans, credentials, data, unpublished material) and to use it only to perform the contracted work. This obligation survives the end of the contract.`,
  },
  {
    title: '10. Termination',
    body: `You may stop using the Platform at any time. Contracts in progress should be completed or cancelled per the Cancellation Policy before closing your account. Operalyn may suspend or terminate your account for violations of this Agreement or the Terms of Service. Earned, approved amounts remain payable to you after lawful termination, subject to final review.

For questions about this Agreement, contact ${COMPANY.email}.`,
  },
]

export default function FreelancerAgreement() {
  return (
    <PolicyPage
      title="Freelancer Agreement"
      intro="This agreement sets out the terms that apply to Freelancers offering services on Operalyn — covering contracts, payments, commission, intellectual property, and professional conduct."
      sections={SECTIONS}
      related={[
        ['Client Agreement', '/client-agreement'],
        ['Terms of Service', '/terms'],
        ['Pricing', '/pricing'],
        ['Cancellation Policy', '/cancellation-policy'],
      ]}
    />
  )
}
