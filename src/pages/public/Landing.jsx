import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getPublicSettings } from '@/api/admin'

/* ── Colour tokens ───────────────────────────────────────── */
const C = {
  ground:  '#FFFFFF',
  ground2: '#F8FAFC',
  ground3: '#F1F5F9',
  text:    '#0F172A',
  muted:   '#64748B',
  subtle:  '#94A3B8',
  accent:  '#334155',
  accentHover: '#1E293B',
  amber:   '#D97706',
  green:   '#059669',
  border:  '#E2E8F0',
  borderDark: '#CBD5E1',
}

/* ── Reveal-on-scroll hook ──────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ── Staggered children reveal ──────────────────────────── */
function useStagger(count, baseDelay = 0.1) {
  return Array.from({ length: count }, (_, i) => ({
    transition: `opacity 0.5s ease ${baseDelay + i * 0.08}s, transform 0.5s ease ${baseDelay + i * 0.08}s`,
  }))
}

/* ── Data ───────────────────────────────────────────────── */
const HERO_PROJECTS = [
  {
    title:    'Build a React dashboard for SaaS CRM',
    category: 'Development',
    budget:   '₹18,000 – ₹30,000',
    age:      '2 hours ago',
    bids:     4,
    skills:   ['React', 'Node.js'],
    color:    '#6366F1',
    catBg:    '#EEF2FF',
    catText:  '#4338CA',
  },
  {
    title:    'Logo + brand identity for D2C food brand',
    category: 'Design',
    budget:   '₹8,000 – ₹15,000',
    age:      '5 hours ago',
    bids:     9,
    skills:   ['Logo Design', 'Branding'],
    color:    '#EC4899',
    catBg:    '#FDF2F8',
    catText:  '#9D174D',
  },
  {
    title:    '10 SEO blog posts — fintech niche',
    category: 'Writing',
    budget:   '₹5,000 – ₹8,000',
    age:      '1 day ago',
    bids:     12,
    skills:   ['Content Writing', 'SEO'],
    color:    '#10B981',
    catBg:    '#ECFDF5',
    catText:  '#065F46',
  },
]

const CATEGORIES = [
  { name: 'Development', color: '#6366F1', bg: '#EEF2FF' },
  { name: 'Design',      color: '#EC4899', bg: '#FDF2F8' },
  { name: 'Marketing',   color: '#F59E0B', bg: '#FFFBEB' },
  { name: 'Writing',     color: '#10B981', bg: '#ECFDF5' },
  { name: 'Business',    color: '#3B82F6', bg: '#EFF6FF' },
  { name: 'Media',       color: '#8B5CF6', bg: '#F5F3FF' },
  { name: 'Architecture',color: '#F97316', bg: '#FFF7ED' },
]

const STEPS = [
  {
    n: '1',
    icon: '📋',
    title: 'Post your project',
    body: 'Describe what you need, set a budget, and choose required skills. Free and takes under five minutes.',
    cta: 'Post a project',
    to: '/auth/register',
  },
  {
    n: '2',
    icon: '🔍',
    title: 'Review proposals',
    body: 'Verified freelancers submit bids with cover letters, timelines, and portfolios. You compare and choose.',
    cta: null,
    to: null,
  },
  {
    n: '3',
    icon: '✅',
    title: 'Pay per milestone',
    body: "Set milestones. Approve work. Payment releases when you're satisfied — not before. Via Razorpay, in INR.",
    cta: null,
    to: null,
  },
]

const FEATURES = [
  {
    icon: '🎯',
    bg: '#EEF2FF',
    color: '#4338CA',
    title: 'Milestone-based payments',
    body: 'Split any project into checkpoints. Money moves only when you approve — no upfront risk, no surprises.',
  },
  {
    icon: '✅',
    bg: '#ECFDF5',
    color: '#065F46',
    title: 'ID-verified freelancers',
    body: 'Every freelancer submits a government ID before getting a Verified badge. You see who you\'re hiring.',
  },
  {
    icon: '💬',
    bg: '#F0F9FF',
    color: '#0369A1',
    title: 'Built-in workspace',
    body: 'Chat, share files, submit work, and track milestones — everything in one contract thread, nothing lost.',
  },
]

const STATS = [
  { value: '1,200+', label: 'Verified freelancers' },
  { value: '800+',   label: 'Projects completed' },
  { value: '₹2.5Cr+', label: 'Paid to freelancers' },
  { value: '4.8★',  label: 'Average rating' },
]

const TESTIMONIALS = [
  {
    quote: 'Found a brilliant React developer in 2 days. Milestone payments made the whole project stress-free.',
    name:  'Priya Sharma',
    role:  'Founder, D2C Brand · Mumbai',
    initials: 'PS',
    bg:    '#EEF2FF',
    color: '#4338CA',
  },
  {
    quote: 'I\'ve completed 14 projects on Operalyn. Clear scope, milestone payouts, and clients who actually know what they want.',
    name:  'Rahul Mehta',
    role:  'Full-stack Developer · Bangalore',
    initials: 'RM',
    bg:    '#ECFDF5',
    color: '#065F46',
  },
  {
    quote: 'The ID verification gives me confidence. Every freelancer I\'ve hired has been professional and accountable.',
    name:  'Ankit Joshi',
    role:  'Marketing Head, SaaS Co. · Delhi',
    initials: 'AJ',
    bg:    '#FFF7ED',
    color: '#9A3412',
  },
]

/* ── Shared button styles ───────────────────────────────── */
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '13px 26px', fontSize: 15, fontWeight: 700,
  background: C.accent, color: '#fff',
  textDecoration: 'none', borderRadius: 10,
  border: 'none', cursor: 'pointer',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
  transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
}
const btnOutline = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '13px 26px', fontSize: 15, fontWeight: 600,
  border: `1.5px solid ${C.border}`, color: C.text,
  textDecoration: 'none', borderRadius: 10, background: C.ground,
  cursor: 'pointer',
  transition: 'border-color 0.15s, background 0.15s',
}

export default function Landing() {
  const { user } = useAuth()
  const { data: settingsData } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn:  getPublicSettings,
    staleTime: 5 * 60 * 1000,
  })
  const commissionRate = settingsData?.data?.commission_rate ?? '12'

  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'freelancer'
      ? '/freelancer'
      : '/client'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [heroRef,   heroVis]   = useReveal(0.05)
  const [statsRef,  statsVis]  = useReveal(0.1)
  const [stepsRef,  stepsVis]  = useReveal(0.1)
  const [catRef,    catVis]    = useReveal(0.1)
  const [featRef,   featVis]   = useReveal(0.1)
  const [testiRef,  testiVis]  = useReveal(0.1)
  const [flRef,     flVis]     = useReveal(0.1)

  const staggerSteps = useStagger(STEPS.length, 0.1)
  const staggerCats  = useStagger(CATEGORIES.length, 0.05)
  const staggerFeat  = useStagger(FEATURES.length, 0.1)
  const staggerTesti = useStagger(TESTIMONIALS.length, 0.12)

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.ground, color: C.text, overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Desktop nav links */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link to="/about" style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.ground2 }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent' }}
            >About</Link>
            {user ? (
              <Link to={dashboardPath} style={btnPrimary}>Dashboard →</Link>
            ) : (
              <>
                <Link to="/auth/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.ground2 }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent' }}
                >Sign in</Link>
                <Link to="/auth/register" style={btnPrimary}>Get started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
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

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute', top: 64, left: 0, right: 0, zIndex: 100,
            background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${C.border}`,
            padding: '16px 20px 20px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', fontSize: 15, fontWeight: 500, color: C.text, textDecoration: 'none', borderRadius: 8 }}>About</Link>
            {user ? (
              <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)} style={{ ...btnPrimary, textAlign: 'center', justifyContent: 'center' }}>Dashboard →</Link>
            ) : (
              <>
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px 12px', fontSize: 15, fontWeight: 500, color: C.text, textDecoration: 'none', borderRadius: 8 }}>Sign in</Link>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)} style={{ ...btnPrimary, textAlign: 'center', justifyContent: 'center' }}>Get started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(226,232,240,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226,232,240,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        {/* Soft radial glow top-left */}
        <div style={{
          position: 'absolute', top: -80, left: -80, width: 500, height: 500, zIndex: 0,
          background: 'radial-gradient(ellipse, rgba(219,234,254,0.6) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div ref={heroRef} style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1160, margin: '0 auto', padding: '88px 24px 80px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
          opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#FEF3C7', border: '1px solid #FDE68A',
              borderRadius: 100, padding: '5px 14px', marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'inline-block', boxShadow: '0 0 0 3px rgba(217,119,6,0.2)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                India's Professional Freelance Network
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 'clamp(34px, 4.2vw, 58px)',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: C.text,
              marginBottom: 22,
            }}>
              Hire skilled<br />
              freelancers.<br />
              <span style={{ color: C.subtle, fontWeight: 400 }}>Get paid for great work.</span>
            </h1>

            <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Operalyn connects Indian businesses with independent professionals — developers, designers, marketers, and more. Pay milestone by milestone, in INR.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link to="/auth/register"
                style={btnPrimary}
                onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(51,65,85,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)' }}
              >
                Post a project — free
              </Link>
              <Link to="/auth/register"
                style={btnOutline}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderDark; e.currentTarget.style.background = C.ground2 }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.ground }}
              >
                Browse projects
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                ['₹0', 'to post a project'],
                [`${commissionRate}%`, 'commission on success only'],
                ['INR', 'payouts via Razorpay'],
              ].map(([val, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: C.amber }}>{val}</span>
                  <span style={{ fontSize: 12, color: C.subtle }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — project cards */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: '-20px',
              background: 'radial-gradient(ellipse at 60% 40%, rgba(219,234,254,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {HERO_PROJECTS.map((p, i) => (
                <div key={p.title} style={{
                  background: '#fff',
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: `3px solid ${p.color}`,
                  opacity:   heroVis ? 1 : 0,
                  transform: heroVis ? 'none' : 'translateX(24px)',
                  transition: `opacity 0.55s ease ${0.2 + i * 0.12}s, transform 0.55s ease ${0.2 + i * 0.12}s`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, flex: 1 }}>{p.title}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                      background: p.catBg, color: p.catText,
                      borderRadius: 6, padding: '2px 8px',
                    }}>{p.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {p.skills.map(s => (
                        <span key={s} style={{
                          fontSize: 11, padding: '2px 8px',
                          background: C.ground2, color: C.muted,
                          borderRadius: 4, fontWeight: 500,
                          border: `1px solid ${C.border}`,
                        }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.budget}</p>
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        <span style={{ color: p.color, fontWeight: 600 }}>{p.bids} proposals</span> · {p.age}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Live indicator */}
              <div style={{
                textAlign: 'center', paddingTop: 4,
                opacity: heroVis ? 1 : 0,
                transition: 'opacity 0.5s ease 0.65s',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: C.muted,
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  borderRadius: 100, padding: '4px 12px',
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#22C55E',
                    boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
                    display: 'inline-block',
                  }} />
                  47 more projects open right now
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section ref={statsRef} style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.ground2 }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          opacity: statsVis ? 1 : 0, transform: statsVis ? 'none' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '24px 32px',
              borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : 'none',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section ref={stepsRef} style={{ padding: '88px 24px', background: C.ground }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 10 }}>
              The process
            </p>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 700, letterSpacing: '-0.025em', color: C.text,
              lineHeight: 1.15,
            }}>
              From posting to payment<br />in three steps.
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            opacity: stepsVis ? 1 : 0, transform: stepsVis ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRight: i < STEPS.length - 1 ? 'none' : `1px solid ${C.border}`,
                borderRadius: 14,
                padding: '36px 28px',
                position: 'relative',
                ...staggerSteps[i],
              }}>
                {/* Step number */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.accent} 0%, #475569 100%)`,
                  color: '#fff',
                  fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700,
                  marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(51,65,85,0.25)',
                }}>
                  {s.n}
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{s.body}</p>

                {s.cta && (
                  <Link to={s.to} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    marginTop: 20, fontSize: 13, fontWeight: 600, color: C.accent,
                    textDecoration: 'none',
                    transition: 'gap 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.gap = '8px' }}
                  onMouseLeave={e => { e.currentTarget.style.gap = '4px' }}
                  >
                    {s.cta} →
                  </Link>
                )}

                {/* Connector arrow between steps — hidden on mobile */}
                {i < STEPS.length - 1 && (
                  <div className="step-connector" style={{
                    position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
                    width: 24, height: 24, background: '#fff',
                    border: `1px solid ${C.border}`, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: C.subtle, zIndex: 1,
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section ref={catRef} style={{ padding: '72px 24px', background: C.ground2 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 32, textAlign: 'center' }}>
            Browse by category
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
          }}>
            {CATEGORIES.map((c, i) => (
              <Link key={c.name} to="/auth/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: '#fff', border: `1.5px solid ${C.border}`,
                borderRadius: 100, fontSize: 14, fontWeight: 500, color: C.text,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                opacity: catVis ? 1 : 0,
                transform: catVis ? 'none' : 'scale(0.95)',
                transition: `opacity 0.4s ease ${0.05 + i * 0.05}s, transform 0.4s ease ${0.05 + i * 0.05}s, border-color 0.15s, box-shadow 0.15s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = c.color
                e.currentTarget.style.boxShadow = `0 3px 12px ${c.color}25`
                e.currentTarget.style.color = c.color
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                e.currentTarget.style.color = C.text
              }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section ref={featRef} style={{ padding: '88px 24px', background: C.ground }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 10 }}>
              Why Operalyn
            </p>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3vw, 38px)',
              fontWeight: 700, letterSpacing: '-0.025em', color: C.text,
              lineHeight: 1.2, maxWidth: 500,
            }}>
              Built for how professional work actually happens.
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
          }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '28px 24px',
                opacity: featVis ? 1 : 0,
                transform: featVis ? 'none' : 'translateY(16px)',
                transition: `opacity 0.5s ease ${0.1 + i * 0.1}s, transform 0.5s ease ${0.1 + i * 0.1}s, box-shadow 0.2s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = featVis ? 'none' : 'translateY(16px)' }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.35 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section ref={testiRef} style={{ padding: '88px 24px', background: C.ground2 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>
              What people say
            </p>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 2.8vw, 36px)',
              fontWeight: 700, letterSpacing: '-0.025em', color: C.text, lineHeight: 1.2,
            }}>
              Trusted by clients and freelancers alike.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} style={{
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: 16, padding: '28px 24px',
                opacity: testiVis ? 1 : 0,
                transform: testiVis ? 'none' : 'translateY(16px)',
                transition: `opacity 0.5s ease ${0.1 + i * 0.12}s, transform 0.5s ease ${0.1 + i * 0.12}s`,
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} style={{ color: '#F59E0B', fontSize: 14 }}>★</span>
                  ))}
                </div>

                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: t.bg, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR FREELANCERS ──────────────────────────────── */}
      <section ref={flRef} style={{ background: '#0F172A', padding: '96px 24px' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center',
          opacity: flVis ? 1 : 0, transform: flVis ? 'none' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34D399', marginBottom: 16 }}>
              For freelancers
            </p>
            <h2 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px, 3vw, 44px)',
              fontWeight: 700, letterSpacing: '-0.025em', color: '#F8FAFC',
              lineHeight: 1.15, marginBottom: 20,
            }}>
              Your skills have<br />a market.<br />
              <span style={{ color: '#475569', fontWeight: 400 }}>Find it here.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36 }}>
              Browse projects, submit proposals, deliver work, and get paid — all on one platform. No bidding wars. Clear milestones. INR payouts.
            </p>
            <Link to="/auth/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '13px 26px', fontSize: 15, fontWeight: 700,
              background: '#34D399', color: '#064E3B',
              textDecoration: 'none', borderRadius: 10,
              transition: 'opacity 0.15s, transform 0.15s',
              boxShadow: '0 2px 8px rgba(52,211,153,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
            >
              Create a freelancer profile →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Browse real projects', 'Filter by category, budget, and skill. Every listing has a budget range — no fishing expeditions.'],
              ['Milestone-based work', 'Agree on deliverables upfront. No ambiguous scope. Get paid per milestone, not when the client feels like it.'],
              ['Your profile is your portfolio', 'Showcase work samples, display verified reviews, and build a reputation that follows you across projects.'],
            ].map(([title, body], i) => (
              <div key={title} style={{
                display: 'flex', gap: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '20px 20px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#064E3B', flexShrink: 0, marginTop: 1,
                }}>✓</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 5 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section style={{ padding: '104px 24px', background: C.ground, textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(30px, 4vw, 48px)',
            fontWeight: 700, letterSpacing: '-0.025em', color: C.text,
            lineHeight: 1.12, marginBottom: 16,
          }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 44 }}>
            No setup fee. No monthly subscription. You pay {commissionRate}% commission only when work is successfully completed.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link to="/auth/register"
              style={{ ...btnPrimary, padding: '15px 36px', fontSize: 16 }}
              onMouseEnter={e => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(51,65,85,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)' }}
            >
              Hire a freelancer
            </Link>
            <Link to="/auth/register"
              style={{ ...btnOutline, padding: '15px 36px', fontSize: 16 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderDark; e.currentTarget.style.background = C.ground2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.ground }}
            >
              Find work
            </Link>
          </div>
          <p style={{ fontSize: 13, color: C.subtle }}>Create an account in under 2 minutes. No credit card required.</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.ground2 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px' }}>

          {/* Top grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, alignItems: 'start', marginBottom: 40 }}>

            {/* Brand + company info */}
            <div>
              <img src="/operalynLogo.png" alt="Operalyn" style={{ height: 34, width: 'auto', objectFit: 'contain', marginBottom: 14 }} />
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 16, maxWidth: 240 }}>
                India's professional freelance network. Milestone-based payments. INR payouts via Razorpay.
              </p>
              {/* Contact */}
              <a href="mailto:operalyn.freelancenetwork@gmail.com" style={{
                fontSize: 12, color: C.muted, textDecoration: 'none', display: 'block', marginBottom: 4,
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >
                📧 operalyn.freelancenetwork@gmail.com
              </a>
            </div>

            {/* Platform links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[['Post a project', '/auth/register'], ['Browse freelancers', '/auth/register'], ['How it works', '/auth/register'], ['Sign in', '/auth/login']].map(([label, to]) => (
                  <Link key={label} to={to} style={{ fontSize: 13, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Freelancers links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Freelancers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[['Create a profile', '/auth/register'], ['Browse projects', '/auth/register'], ['How to get paid', '/auth/register'], ['My proposals', '/auth/register']].map(([label, to]) => (
                  <Link key={label} to={to} style={{ fontSize: 13, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Company</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[['About us', '/about'], ['Terms of service', '/terms'], ['Privacy policy', '/privacy'], ['Contact us', '/about']].map(([label, to]) => (
                  <Link key={label} to={to} style={{ fontSize: 13, color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Company details strip */}
          <div style={{
            borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 16,
            background: '#F1F5F9', borderRadius: 12, padding: '20px 24px',
            marginTop: 8,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.text, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Registered Company Details
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px 32px' }}>
              {[
                ['Company', 'OPERALYN FREELANCE NETWORK SERVICES PRIVATE LIMITED'],
                ['CIN', 'U62020RI2026PTC113939'],
                ['GST', '08AAFCO1644L1Z8'],
                ['Address', 'Unit No.TB-404, 4th Floor, R-Tech Capital Highstreet Mall, Mahal Road, Jagatpura, Jaipur, Rajasthan – 302017'],
              ].map(([key, val]) => (
                <div key={key} style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, flexShrink: 0, minWidth: 56 }}>{key}:</span>
                  <span style={{ fontSize: 11, color: C.text }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: C.subtle }}>
              © {new Date().getFullYear()} Operalyn Freelance Network Services Private Limited · All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: C.subtle }}>
              Made in 🇮🇳 India
            </p>
          </div>
        </div>
      </footer>

      {/* ── Responsive overrides ──────────────────────────── */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }

        /* Nav: show hamburger, hide desktop links on mobile */
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }

        /* Steps: single column + hide connectors on mobile */
        @media (max-width: 768px) {
          .step-connector { display: none !important; }

          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          section > div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          footer > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        /* Steps section: fix border between stacked cards */
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: repeat(3"] > div {
            border-right: 1px solid #E2E8F0 !important;
            border-radius: 14px !important;
          }
        }

        @media (max-width: 480px) {
          footer > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
