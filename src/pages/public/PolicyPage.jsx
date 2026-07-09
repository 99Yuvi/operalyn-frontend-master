import { Link } from 'react-router-dom'

export const C = {
  ground: '#FFFFFF', ground2: '#F8FAFC', ground3: '#F1F5F9',
  text: '#0F172A', muted: '#64748B', subtle: '#94A3B8',
  accent: '#334155', border: '#E2E8F0',
}

// Values must match the Certificate of Incorporation (CIN) and
// GST certificate (address = Principal Place of Business) exactly.
export const COMPANY = {
  name:    'Operalyn Freelance Network Services Private Limited',
  cin:     'U62020RJ2026PTC113939',
  gst:     '08AAFCO1644L1Z8',
  address: 'CPI-231, Appreal Park, RIICO Area Sitapura, Unit No. TB-404, 4th Floor,\nR-Tech Capital Highstreet Mall, Mahal Road, Jagatpura, Jaipur, Rajasthan – 302017',
  email:   'operalyn.freelancenetwork@gmail.com',
}

/**
 * Shared shell for all legal / policy pages — same nav, header,
 * section list, related-links block and footer as Terms & Privacy.
 */
export default function PolicyPage({ label = 'Legal', title, updated = '1 July 2026', intro, sections, related = [], children }) {
  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.ground, color: C.text, overflowX: 'hidden' }}>

      {/* Company name strip — full legal name visible on first interaction */}
      <div style={{
        background: '#0F172A', color: '#CBD5E1', textAlign: 'center',
        padding: '7px 16px', fontSize: 11.5, fontWeight: 500, letterSpacing: '0.05em',
      }}>
        {COMPANY.name.toUpperCase()}
      </div>

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
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>{label}</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: C.text, letterSpacing: '-0.025em', marginBottom: 10 }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>Last updated: {updated} &nbsp;·&nbsp; Effective: {updated}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        {intro && (
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, marginBottom: 40, padding: '16px 20px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12 }}>
            {intro}
          </p>
        )}

        {sections && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {sections.map((s) => (
              <div key={s.title}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 12 }}>{s.title}</h2>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.85, whiteSpace: 'pre-line' }}>{s.body}</div>
              </div>
            ))}
          </div>
        )}

        {children}

        {/* Related links */}
        {related.length > 0 && (
          <div style={{ marginTop: 56, padding: '24px', background: C.ground2, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>Related documents</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {related.map(([text, to]) => (
                <Link key={to} to={to} style={{ fontSize: 13, color: C.accent, textDecoration: 'none', fontWeight: 500 }}>{text} →</Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.ground2, padding: '24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: C.subtle }}>© {new Date().getFullYear()} {COMPANY.name}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/terms" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Terms</Link>
            <Link to="/privacy" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Privacy</Link>
            <Link to="/refund-policy" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Refunds</Link>
            <Link to="/contact" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
