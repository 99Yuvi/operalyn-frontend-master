import { Link } from 'react-router-dom'

const C = {
  ground: '#FFFFFF', ground2: '#F8FAFC', ground3: '#F1F5F9',
  text: '#0F172A', muted: '#64748B', subtle: '#94A3B8',
  accent: '#334155', border: '#E2E8F0',
}

const SECTIONS = [
  {
    title: '1. Introduction',
    body: `Operalyn Freelance Network Services Private Limited ("Operalyn", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform at operalyn.com.

This Policy is published in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and other applicable Indian data protection laws.`,
  },
  {
    title: '2. Information We Collect',
    body: `We collect the following categories of information:

Account Information: Name, email address, mobile number, and password when you register.

Profile Information: Professional bio, skills, portfolio items, education, work experience, profile photo, and location (for Freelancers).

Identity Verification: Government-issued photo ID (Aadhaar, PAN, Passport, or Voter ID) submitted by Freelancers for verification purposes.

Payment Information: Bank account details, UPI IDs, or wallet addresses for processing payouts. We do not store full credit/debit card numbers; payment processing is handled by Razorpay.

Transaction Data: Records of projects, proposals, contracts, milestones, and payments on the Platform.

Communication Data: Messages exchanged between users on the Platform's chat feature.

Usage Data: IP address, browser type, device information, pages visited, and time spent on the Platform, collected via cookies and similar technologies.`,
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the information we collect to:
• Create and manage your account
• Facilitate matching between Clients and Freelancers
• Process payments and maintain transaction records
• Verify Freelancer identities and display Verified badges
• Send service-related notifications (new messages, milestone updates, payment confirmations)
• Send promotional emails and newsletters (you may opt out at any time)
• Comply with legal obligations under Indian law
• Detect and prevent fraud, abuse, and security threats
• Improve our Platform and user experience through analytics
• Resolve disputes between users`,
  },
  {
    title: '4. Sharing of Information',
    body: `We do not sell your personal information to third parties. We may share your information with:

Other Users: Your public profile information (name, skills, bio, reviews, portfolio) is visible to other Platform users. Your contact details are not shared without your consent.

Payment Processors: We share necessary financial information with Razorpay to process payments. Razorpay's privacy policy governs their use of your data.

Service Providers: We may engage third-party vendors for hosting, analytics, customer support, and email delivery, who are bound by confidentiality obligations.

Legal Authorities: We may disclose your information if required by law, court order, or government authority under applicable Indian law, including the IT Act, 2000.

Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, with prior notice to you.`,
  },
  {
    title: '5. Identity Verification Data',
    body: `Government-issued ID documents submitted by Freelancers for verification are treated as Sensitive Personal Data or Information (SPDI) under the IT Rules, 2011. We:
• Store such documents with encryption
• Limit access to authorised personnel only
• Use them solely for identity verification purposes
• Retain them only as long as required by law or as necessary to maintain the Verified badge status
• Do not share them with other users or third parties except as required by law`,
  },
  {
    title: '6. Cookies and Tracking',
    body: `We use cookies and similar tracking technologies to enhance your experience on the Platform. Types of cookies we use:

Essential Cookies: Required for the Platform to function (session management, security). These cannot be disabled.

Analytics Cookies: Help us understand how users interact with the Platform (we use privacy-respecting analytics tools).

Preference Cookies: Remember your settings and preferences.

You may disable non-essential cookies through your browser settings, but this may affect Platform functionality.`,
  },
  {
    title: '7. Data Retention',
    body: `We retain your personal information for as long as your account is active or as needed to provide you services. Specifically:

Account data is retained for the duration of your account and for 3 years after deletion, as required by Indian tax and legal compliance requirements.

Transaction records are retained for 7 years as required by Indian accounting standards and GST law.

Identity verification documents are retained for the duration of the Freelancer's active status plus 2 years.

You may request deletion of your account and associated data at any time, subject to our retention obligations under law.`,
  },
  {
    title: '8. Data Security',
    body: `We implement industry-standard security measures to protect your personal information, including:
• HTTPS encryption for all data in transit
• AES-256 encryption for sensitive data at rest
• Access controls limiting data access to authorised personnel
• Regular security audits and vulnerability assessments
• Secure, SOC 2-compliant cloud infrastructure

While we take reasonable steps to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security and are not responsible for breaches resulting from factors outside our reasonable control.`,
  },
  {
    title: '9. Your Rights',
    body: `Under applicable Indian law, you have the right to:

Access: Request a copy of the personal information we hold about you.

Correction: Request correction of inaccurate or incomplete personal information.

Deletion: Request deletion of your personal information, subject to our legal retention obligations.

Opt-out: Unsubscribe from promotional emails at any time via the unsubscribe link in our emails or by contacting us.

Grievance Redressal: File a complaint with our Grievance Officer (contact details below) regarding any privacy concern.

To exercise any of these rights, contact us at operalyn.freelancenetwork@gmail.com. We will respond to your request within 30 days.`,
  },
  {
    title: '10. Third-Party Links',
    body: `The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of such third parties. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: '11. Children\'s Privacy',
    body: `The Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a person under 18, we will delete it promptly.`,
  },
  {
    title: '12. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by a prominent notice on the Platform. Your continued use of the Platform after changes are posted constitutes acceptance of the revised Policy.`,
  },
  {
    title: '13. Grievance Officer',
    body: `In accordance with the Information Technology Act, 2000 and the IT Rules, 2011, the name and contact details of the Grievance Officer are:

Jitendra Kumar
Director, Operalyn Freelance Network Services Private Limited
Unit No. TB-404, 4th Floor, R-Tech Capital Highstreet Mall
Mahal Road, Jagatpura, Jaipur, Rajasthan – 302017
Email: operalyn.freelancenetwork@gmail.com
Phone: +91 72406 95689

The Grievance Officer shall acknowledge your complaint within 24 hours and resolve it within 15 days of receipt.`,
  },
]

export default function Privacy() {
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>Last updated: 1 July 2026 &nbsp;·&nbsp; Effective: 1 July 2026</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 40, padding: '16px 20px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12 }}>
          Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it — in plain language.
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
            <Link to="/terms" style={{ fontSize: 13, color: C.accent, textDecoration: 'none', fontWeight: 500 }}>Terms of Service →</Link>
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
