import { Link } from 'react-router-dom'

const C = {
  ground: '#FFFFFF', ground2: '#F8FAFC', ground3: '#F1F5F9',
  text: '#0F172A', muted: '#64748B', subtle: '#94A3B8',
  accent: '#334155', border: '#E2E8F0',
}

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the Operalyn platform ("Platform"), you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations of India. If you do not agree with any of these Terms, you are prohibited from using or accessing this Platform.

These Terms constitute a legally binding agreement between you and Operalyn Freelance Network Services Private Limited (CIN: U62020RI2026PTC113939), a company incorporated under the Companies Act, 2013.`,
  },
  {
    title: '2. Platform Description',
    body: `Operalyn is an online marketplace that connects clients ("Clients") who require professional services with independent professionals ("Freelancers"). The Platform facilitates the posting of projects, submission of proposals, execution of contracts, and processing of payments. Operalyn acts solely as an intermediary and is not a party to any agreement between Clients and Freelancers.`,
  },
  {
    title: '3. User Accounts',
    body: `To use the Platform, you must register for an account. You agree to:
• Provide accurate, current, and complete information during registration
• Maintain the security of your password and account
• Notify us immediately of any unauthorized use of your account
• Accept responsibility for all activities under your account

You must be at least 18 years of age to create an account. By registering, you represent and warrant that you meet this age requirement.`,
  },
  {
    title: '4. Freelancer Verification',
    body: `Freelancers on the Platform are required to submit a government-issued photo ID for identity verification before receiving a "Verified" badge. Operalyn uses commercially reasonable efforts to verify submitted documents but does not guarantee the authenticity of any documents or the identity, qualifications, or competence of any Freelancer. Clients are encouraged to independently evaluate Freelancers before entering into contracts.`,
  },
  {
    title: '5. Project Posting and Proposals',
    body: `Clients may post projects on the Platform at no cost. Freelancers may submit proposals in response to posted projects. By posting a project, Clients agree that the project description is accurate and does not violate any applicable laws. Operalyn reserves the right to remove any project posting that violates these Terms or applicable law, at its sole discretion.`,
  },
  {
    title: '6. Contracts and Milestones',
    body: `When a Client accepts a Freelancer's proposal, a Contract is created on the Platform. Contracts are milestone-based: the Client and Freelancer agree on specific deliverables and payment amounts for each milestone. Payments are held in escrow by Operalyn and released to the Freelancer only upon the Client's approval of a completed milestone. This payment protection mechanism is provided as a Platform feature and does not make Operalyn a party to the underlying contract.`,
  },
  {
    title: '7. Payments and Commission',
    body: `All payments on the Platform are processed in Indian Rupees (INR) via Razorpay, a third-party payment gateway. Operalyn charges a commission on successfully completed transactions. The current commission rate is displayed on our Pricing page and may be updated with notice.

Clients are charged the full milestone amount. Upon Client approval, Operalyn deducts its commission and remits the balance to the Freelancer's registered bank account or wallet. Operalyn is not responsible for any bank fees or taxes applicable to payments.`,
  },
  {
    title: '8. Prohibited Activities',
    body: `You agree not to:
• Post false, misleading, or fraudulent project listings or proposals
• Use the Platform to solicit services outside the Platform to avoid commission fees
• Harass, abuse, or harm other users
• Upload viruses or malicious code
• Infringe any intellectual property rights of third parties
• Violate any applicable Indian laws, including the Information Technology Act, 2000
• Create multiple accounts to circumvent bans or restrictions
• Use automated tools to scrape or access the Platform without permission`,
  },
  {
    title: '9. Intellectual Property',
    body: `The Platform, including its design, text, graphics, logos, and software, is the property of Operalyn Freelance Network Services Private Limited and is protected by applicable Indian and international intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.

Content submitted by users (project descriptions, proposals, deliverables) remains the intellectual property of the respective user, subject to a license granted to Operalyn to display such content on the Platform.`,
  },
  {
    title: '10. Dispute Resolution',
    body: `In the event of a dispute between a Client and a Freelancer, both parties agree to first attempt to resolve the dispute through direct communication on the Platform. If resolution is not reached, Operalyn may, at its discretion, offer mediation services to facilitate resolution. Operalyn's decision in any mediation is non-binding unless both parties agree otherwise.

Any legal disputes arising from or related to these Terms or the Platform shall be governed by the laws of India, and the courts of Jaipur, Rajasthan shall have exclusive jurisdiction.`,
  },
  {
    title: '11. Limitation of Liability',
    body: `To the maximum extent permitted by applicable law, Operalyn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, arising from your use of the Platform. Operalyn's total liability to any user shall not exceed the total fees paid by that user to Operalyn in the six months preceding the claim.`,
  },
  {
    title: '12. Termination',
    body: `Operalyn reserves the right to suspend or terminate your account at any time, with or without cause or notice, including for violation of these Terms. Upon termination, your right to use the Platform will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.`,
  },
  {
    title: '13. Changes to Terms',
    body: `Operalyn reserves the right to modify these Terms at any time. We will provide notice of significant changes by email or a prominent notice on the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.`,
  },
  {
    title: '14. Contact Us',
    body: `For any questions about these Terms, please contact us at:

Operalyn Freelance Network Services Private Limited
Unit No. TB-404, 4th Floor, R-Tech Capital Highstreet Mall
Mahal Road, Jagatpura, Jaipur, Rajasthan – 302017
Email: operalyn.freelancenetwork@gmail.com`,
  },
]

export default function Terms() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.ground, color: C.text, overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/" style={{ fontSize: 14, color: C.muted, textDecoration: 'none' }}>Home</Link>
            <Link to="/about" style={{ fontSize: 14, color: C.muted, textDecoration: 'none' }}>About</Link>
            <Link to="/auth/login" style={{ fontSize: 14, color: C.muted, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: C.ground2, borderBottom: `1px solid ${C.border}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>Legal</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', marginBottom: 10 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>Last updated: 1 July 2026 &nbsp;·&nbsp; Effective: 1 July 2026</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 40, padding: '16px 20px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12 }}>
          Please read these Terms of Service carefully before using the Operalyn platform. By using our services, you agree to be bound by these terms.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 12 }}>{s.title}</h2>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.85, whiteSpace: 'pre-line' }}>{s.body}</div>
            </div>
          ))}
        </div>

        {/* Related links */}
        <div style={{ marginTop: 56, padding: '24px', background: C.ground2, border: `1px solid ${C.border}`, borderRadius: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Related documents</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/privacy" style={{ fontSize: 13, color: C.accent, textDecoration: 'none', fontWeight: 500 }}>Privacy Policy →</Link>
            <Link to="/about" style={{ fontSize: 13, color: C.accent, textDecoration: 'none', fontWeight: 500 }}>About Operalyn →</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.ground2, padding: '24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: C.subtle }}>© {new Date().getFullYear()} Operalyn Freelance Network Services Private Limited</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/terms" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Terms</Link>
            <Link to="/privacy" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
