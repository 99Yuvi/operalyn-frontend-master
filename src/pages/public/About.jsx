import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const C = {
  ground:  '#FFFFFF',
  ground2: '#F8FAFC',
  ground3: '#F1F5F9',
  text:    '#0F172A',
  muted:   '#64748B',
  subtle:  '#94A3B8',
  accent:  '#334155',
  border:  '#E2E8F0',
  amber:   '#D97706',
}

const DIRECTORS = [
  {
    name:        'Jitendra Kumar',
    role:        'Director & Co-Founder',
    din:         '11698908',
    email:       'jitendrakumar695689@gmail.com',
    mobile:      '7240695689',
    shareholding: 74,
    initials:    'JK',
    bg:          '#EEF2FF',
    color:       '#4338CA',
  },
  {
    name:        'Kundan Kumar',
    role:        'Director & Co-Founder',
    din:         '11425403',
    email:       'kundankumarr915@gmail.com',
    mobile:      '9649703635',
    shareholding: 26,
    initials:    'KK',
    bg:          '#ECFDF5',
    color:       '#065F46',
  },
]

const VALUES = [
  { icon: '🤝', title: 'Trust first', body: 'Every freelancer is ID-verified. Every payment is milestone-protected. We build accountability into every step.' },
  { icon: '🇮🇳', title: 'Made for India', body: 'INR payouts, Indian categories, Indian tax compliance. Built from the ground up for the Indian market.' },
  { icon: '🎯', title: 'Fair for both sides', body: 'Clients get quality and control. Freelancers get clarity and timely payment. No one gets left behind.' },
]

export default function About() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dashboardPath = user?.role === 'admin' ? '/admin'
    : user?.role === 'freelancer' ? '/freelancer' : '/client'

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.ground, color: C.text, overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Desktop links */}
          <div className="about-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link to="/about" style={{ padding: '8px 14px', fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none', borderRadius: 8, background: C.ground3 }}>About</Link>
            {user ? (
              <Link to={dashboardPath} style={{ padding: '8px 18px', fontSize: 14, fontWeight: 700, background: C.accent, color: '#fff', textDecoration: 'none', borderRadius: 10 }}>Dashboard →</Link>
            ) : (
              <>
                <Link to="/auth/login" style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none', borderRadius: 8 }}>Sign in</Link>
                <Link to="/auth/register" style={{ padding: '8px 18px', fontSize: 14, fontWeight: 700, background: C.accent, color: '#fff', textDecoration: 'none', borderRadius: 10 }}>Get started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="about-nav-hamburger"
            onClick={() => setMobileMenuOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: C.text }}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute', top: 64, left: 0, right: 0, zIndex: 100,
            background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${C.border}`, padding: '16px 20px 20px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', fontSize: 15, color: C.muted, textDecoration: 'none', borderRadius: 8 }}>Home</Link>
            {user ? (
              <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)} style={{ padding: '11px 16px', fontSize: 15, fontWeight: 700, background: C.accent, color: '#fff', textDecoration: 'none', borderRadius: 10, textAlign: 'center' }}>Dashboard →</Link>
            ) : (
              <>
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', fontSize: 15, color: C.text, textDecoration: 'none', borderRadius: 8 }}>Sign in</Link>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)} style={{ padding: '11px 16px', fontSize: 15, fontWeight: 700, background: C.accent, color: '#fff', textDecoration: 'none', borderRadius: 10, textAlign: 'center' }}>Get started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
        padding: '80px 24px 72px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34D399', marginBottom: 16 }}>
            About Operalyn
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 700, color: '#F8FAFC',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            Building India's most trusted<br />freelance network.
          </h1>
          <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            We started Operalyn because hiring freelancers in India was broken — no accountability, late payments, scope creep. We're fixing that.
          </p>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.ground }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 12 }}>
            Our mission
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 700, color: C.text, lineHeight: 1.2,
            letterSpacing: '-0.025em', marginBottom: 20,
          }}>
            To make professional work in India fair, transparent, and reliable.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>
            India has over 15 million freelancers — the world's largest talent pool. Yet most platforms are built for the US or UK market. Operalyn is different: INR payouts, Indian tax compliance, categories that reflect Indian demand, and a milestone payment model designed to protect both clients and freelancers.
          </p>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8 }}>
            We believe that when you hire a professional, you deserve to know exactly who you're working with. That's why every freelancer on Operalyn submits a government-issued ID before earning a Verified badge.
          </p>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section style={{ padding: '72px 24px', background: C.ground2 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 40, textAlign: 'center' }}>
            What we stand for
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {VALUES.map((v) => (
              <div key={v.title} style={{
                background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '28px 24px',
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: C.ground3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 16,
                }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM / DIRECTORS ─────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: C.ground }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 12 }}>
            Leadership
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 2.8vw, 34px)',
            fontWeight: 700, color: C.text, lineHeight: 1.2,
            letterSpacing: '-0.025em', marginBottom: 40,
          }}>
            The people behind Operalyn.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {DIRECTORS.map((d) => (
              <div key={d.name} style={{
                background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '28px 24px',
              }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: d.bg, color: d.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, flexShrink: 0,
                  }}>
                    {d.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>{d.name}</p>
                    <p style={{ fontSize: 13, color: C.muted }}>{d.role}</p>
                  </div>
                </div>

                {/* Shareholding bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Shareholding</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.shareholding}%</span>
                  </div>
                  <div style={{ height: 4, background: C.ground3, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.shareholding}%`, background: d.color, borderRadius: 4 }} />
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['DIN', d.din],
                    ['Email', d.email],
                    ['Mobile', d.mobile],
                  ].map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.subtle, width: 44, flexShrink: 0, paddingTop: 2 }}>{key}</span>
                      {key === 'Email' ? (
                        <a href={`mailto:${val}`} style={{ fontSize: 12, color: C.muted, textDecoration: 'none', wordBreak: 'break-all' }}
                          onMouseEnter={e => e.currentTarget.style.color = C.text}
                          onMouseLeave={e => e.currentTarget.style.color = C.muted}
                        >{val}</a>
                      ) : (
                        <span style={{ fontSize: 12, color: C.muted }}>{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPANY DETAILS ──────────────────────────────── */}
      <section style={{ padding: '72px 24px', background: C.ground2 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
            Company information
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 2.5vw, 30px)',
            fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 28,
          }}>
            Registered company details
          </h2>

          <div style={{
            background: '#fff', border: `1px solid ${C.border}`,
            borderRadius: 16, overflow: 'hidden',
          }}>
            {[
              ['Registered Name',  'OPERALYN FREELANCE NETWORK SERVICES PRIVATE LIMITED'],
              ['CIN',              'U62020RI2026PTC113939'],
              ['GST Number',       '08AAFCO1644L1Z8'],
              ['Registered Office','CPI-231, Appreal Park, RIICO Area Sitapura, Unit No.TB-404, 4th Floor, R-Tech Capital Highstreet Mall, Mahal Road, Jagatpura, Jaipur, Rajasthan – 302017'],
              ['Contact Email',    'operalyn.freelancenetwork@gmail.com'],
            ].map(([key, val], i, arr) => (
              <div key={key} style={{
                display: 'flex', gap: 20, padding: '16px 24px',
                borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                background: i % 2 === 0 ? '#fff' : C.ground2,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, width: 140, flexShrink: 0, paddingTop: 1 }}>
                  {key}
                </span>
                {key === 'Contact Email' ? (
                  <a href={`mailto:${val}`} style={{ fontSize: 13, color: C.text, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >{val}</a>
                ) : (
                  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{val}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', background: C.ground, textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 700, color: C.text, lineHeight: 1.15,
            letterSpacing: '-0.025em', marginBottom: 14,
          }}>
            Ready to join us?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 36 }}>
            Whether you're looking to hire top freelancers or find your next project, Operalyn is built for you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth/register" style={{
              padding: '13px 28px', fontSize: 15, fontWeight: 700,
              background: C.accent, color: '#fff',
              textDecoration: 'none', borderRadius: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}
            >
              Get started — free
            </Link>
            <Link to="/" style={{
              padding: '13px 28px', fontSize: 15, fontWeight: 600,
              border: `1.5px solid ${C.border}`, color: C.text, background: '#fff',
              textDecoration: 'none', borderRadius: 10,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#CBD5E1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.ground2, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
          <p style={{ fontSize: 12, color: C.subtle }}>© {new Date().getFullYear()} Operalyn Freelance Network Services Private Limited</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Home</Link>
            <Link to="/auth/login" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Sign in</Link>
            <Link to="/auth/register" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .about-nav-desktop { display: none !important; }
          .about-nav-hamburger { display: flex !important; }
        }
        @media (max-width: 720px) {
          section > div[style*="grid-template-columns: repeat(3"] { display: flex !important; flex-direction: column !important; gap: 16px !important; }
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"][style*="padding: '16px 24px'"] > div { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}
