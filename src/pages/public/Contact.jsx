import PolicyPage, { C, COMPANY } from './PolicyPage'

const SECTIONS = [
  {
    title: 'Support',
    body: `For any help with your account, projects, contracts, payments, refunds, or anything else, email us — we respond to all queries within 24–48 business hours.

For payment and refund related queries, please include your contract ID and milestone details so we can help you faster.`,
  },
  {
    title: 'Grievance Officer',
    body: `In accordance with the Information Technology Act, 2000 and rules made thereunder, the contact details of the Grievance Officer are:

${COMPANY.name}
${COMPANY.address}
Email: ${COMPANY.email}

Grievances are acknowledged within 48 hours and resolved within 30 days of receipt.`,
  },
]

export default function Contact() {
  return (
    <PolicyPage
      label="Support"
      title="Contact Us"
      intro="Questions, feedback, or need help with a project or payment? We're here."
      sections={SECTIONS}
      related={[
        ['About Operalyn', '/about'],
        ['Refund Policy', '/refund-policy'],
        ['Terms of Service', '/terms'],
      ]}
    >
      {/* Contact cards */}
      <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ padding: 24, border: `1px solid ${C.border}`, borderRadius: 14, background: C.ground2 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.subtle, marginBottom: 10 }}>Email us</p>
          <a href={`mailto:${COMPANY.email}`} style={{ fontSize: 15, fontWeight: 600, color: C.accent, textDecoration: 'none', wordBreak: 'break-all' }}>
            {COMPANY.email}
          </a>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Response within 24–48 business hours</p>
        </div>

        <div style={{ padding: 24, border: `1px solid ${C.border}`, borderRadius: 14, background: C.ground2 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.subtle, marginBottom: 10 }}>Registered office</p>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{COMPANY.address}</p>
        </div>

        <div style={{ padding: 24, border: `1px solid ${C.border}`, borderRadius: 14, background: C.ground2 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.subtle, marginBottom: 10 }}>Company</p>
          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7 }}>{COMPANY.name}</p>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>CIN: {COMPANY.cin}</p>
        </div>
      </div>
    </PolicyPage>
  )
}
