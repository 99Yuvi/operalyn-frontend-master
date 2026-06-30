import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getPublicSettings } from '@/api/admin'

/* ── Colour tokens (matching palette_commit) ─────────────── */
const C = {
  ground:  '#FFFFFF',
  ground2: '#F7F6F4',   // alternating section bg
  text:    '#0F172A',
  muted:   '#64748B',
  accent:  '#334155',   // slate-700 — Operalyn primary
  amber:   '#D97706',   // amber-700 — money / value
  green:   '#065F46',   // emerald-800 — for freelancer section
  border:  '#E2E8F0',
}

/* ── Reveal-on-scroll hook ──────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref  = useRef(null)
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

/* ── Realistic project cards for hero ──────────────────── */
const HERO_PROJECTS = [
  {
    title:    'Build a React dashboard for SaaS CRM',
    category: 'Development',
    budget:   '₹18,000 – ₹30,000',
    age:      '2 hours ago',
    bids:     4,
    skills:   ['React', 'Node.js'],
    dot:      '#6366F1',
  },
  {
    title:    'Logo + brand identity for D2C food brand',
    category: 'Design',
    budget:   '₹8,000 – ₹15,000',
    age:      '5 hours ago',
    bids:     9,
    skills:   ['Logo Design', 'Branding'],
    dot:      '#EC4899',
  },
  {
    title:    '10 SEO blog posts — fintech niche',
    category: 'Writing',
    budget:   '₹5,000 – ₹8,000',
    age:      '1 day ago',
    bids:     12,
    skills:   ['Content Writing', 'SEO'],
    dot:      '#10B981',
  },
]

const CATEGORIES = [
  { name: 'Development',  icon: '⚙️' },
  { name: 'Design',       icon: '🎨' },
  { name: 'Marketing',    icon: '📣' },
  { name: 'Writing',      icon: '✍️' },
  { name: 'Business',     icon: '💼' },
  { name: 'Media',        icon: '🎬' },
  { name: 'Architecture', icon: '🏗️' },
]

const STEPS = [
  {
    n: '1',
    title: 'Post your project',
    body:  'Describe what you need, set a budget, and choose required skills. Free and takes under five minutes.',
    cta:   'Post a project',
    to:    '/auth/register',
  },
  {
    n: '2',
    title: 'Review proposals',
    body:  'Verified freelancers submit bids with cover letters, timelines, and their portfolio. You compare and choose.',
    cta:   null,
    to:    null,
  },
  {
    n: '3',
    title: 'Pay per milestone',
    body:  'Set milestones. Approve work. Payment releases when you\'re satisfied — not before. Via Razorpay, in INR.',
    cta:   null,
    to:    null,
  },
]

const FEATURES = [
  {
    icon: '🎯',
    title: 'Milestone-based payments',
    body:  'Split any project into checkpoints. Money moves only when you approve — no upfront risk, no surprises.',
  },
  {
    icon: '✅',
    title: 'ID-verified freelancers',
    body:  'Every freelancer submits a government ID before getting a Verified badge. You see who you\'re hiring.',
  },
  {
    icon: '💬',
    title: 'Built-in workspace',
    body:  'Chat, share files, submit work, and track milestones — everything in one contract thread, nothing lost in email.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const { data: settingsData } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn:  getPublicSettings,
    staleTime: 5 * 60 * 1000, // cache 5 min — changes rarely
  })
  const commissionRate = settingsData?.data?.commission_rate ?? '12'

  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'freelancer'
      ? '/freelancer'
      : '/client'

  const [heroRef, heroVis]     = useReveal(0.05)
  const [stepsRef, stepsVis]   = useReveal(0.1)
  const [catRef, catVis]       = useReveal(0.1)
  const [featRef, featVis]     = useReveal(0.1)
  const [flRef, flVis]         = useReveal(0.1)

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", background: C.ground, color: C.text, overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position:     'sticky', top: 0, zIndex: 50,
        background:   'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, color: C.accent, letterSpacing: '-0.02em' }}>
            Operalyn
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <Link to={dashboardPath} style={{
                padding: '8px 18px', fontSize: 14, fontWeight: 600,
                background: C.accent, color: '#fff',
                textDecoration: 'none', borderRadius: 8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Go to dashboard →
              </Link>
            ) : (
              <>
                <Link to="/auth/login" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 500, color: C.muted, textDecoration: 'none', borderRadius: 8 }}>
                  Sign in
                </Link>
                <Link to="/auth/register" style={{
                  padding: '8px 18px', fontSize: 14, fontWeight: 600,
                  background: C.accent, color: '#fff',
                  textDecoration: 'none', borderRadius: 8,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} style={{
        maxWidth: 1160, margin: '0 auto', padding: '80px 24px 72px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center',
        opacity: heroVis ? 1 : 0, transform: heroVis ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        {/* Left — pitch */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: 20, padding: '4px 12px', marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#92400E', letterSpacing: '0.04em' }}>
              INDIA'S PROFESSIONAL FREELANCE NETWORK
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: C.text,
            marginBottom: 20,
          }}>
            Hire skilled<br />
            freelancers.<br />
            <span style={{ color: C.muted, fontWeight: 400 }}>Get paid for great work.</span>
          </h1>

          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.65, marginBottom: 32, maxWidth: 420 }}>
            Operalyn connects Indian businesses with independent professionals — developers, designers, marketers, and more. Pay milestone by milestone, in INR.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <Link to="/auth/register" style={{
              padding: '13px 28px', fontSize: 15, fontWeight: 700,
              background: C.accent, color: '#fff',
              textDecoration: 'none', borderRadius: 10,
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(51,65,85,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)' }}
            >
              Post a project — free
            </Link>
            <Link to="/auth/register" style={{
              padding: '13px 28px', fontSize: 15, fontWeight: 600,
              border: `1.5px solid ${C.border}`, color: C.text,
              textDecoration: 'none', borderRadius: 10, background: C.ground,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#94A3B8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              Browse projects
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              ['₹0', 'to post a project'],
              [`${commissionRate}%`, 'commission on success only'],
              ['7', 'professional categories'],
            ].map(([val, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: C.amber }}>{val}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — live project cards */}
        <div style={{ position: 'relative' }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute', inset: '-20px',
            background: 'radial-gradient(ellipse at 60% 40%, rgba(219,234,254,0.4) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HERO_PROJECTS.map((p, i) => (
              <div key={p.title} style={{
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                opacity:   heroVis ? 1 : 0,
                transform: heroVis ? 'none' : 'translateX(20px)',
                transition: `opacity 0.5s ease ${0.15 + i * 0.1}s, transform 0.5s ease ${0.15 + i * 0.1}s`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, flex: 1 }}>{p.title}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                    background: '#F8FAFC', border: `1px solid ${C.border}`,
                    borderRadius: 6, padding: '2px 8px', color: C.muted,
                  }}>{p.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.skills.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 7px', background: '#EFF6FF', color: '#3730A3', borderRadius: 4, fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.budget}</p>
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                      <span style={{ color: p.dot, fontWeight: 600 }}>{p.bids} proposals</span> · {p.age}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* "More open now" label */}
            <div style={{
              textAlign: 'center', paddingTop: 4,
              opacity: heroVis ? 1 : 0,
              transition: 'opacity 0.5s ease 0.6s',
            }}>
              <span style={{ fontSize: 12, color: C.muted }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10B981', marginRight: 6, verticalAlign: 'middle' }} />
                47 more projects open right now
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}` }} />

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section ref={stepsRef} style={{ background: C.ground2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 12 }}>
            The process
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)',
            fontWeight: 700, letterSpacing: '-0.02em', color: C.text,
            marginBottom: 56, lineHeight: 1.15,
          }}>
            From posting to payment<br />in three steps.
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2,
            opacity: stepsVis ? 1 : 0, transform: stepsVis ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderRadius: i === 0 ? '12px 0 0 12px' : i === STEPS.length - 1 ? '0 12px 12px 0' : '0',
                padding: '32px 28px',
                position: 'relative',
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  background: C.accent, color: '#fff',
                  fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700,
                  marginBottom: 20,
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{s.body}</p>
                {s.cta && (
                  <Link to={s.to} style={{
                    display: 'inline-block', marginTop: 20,
                    fontSize: 13, fontWeight: 600, color: C.accent,
                    textDecoration: 'none', borderBottom: `1.5px solid ${C.accent}`,
                    paddingBottom: 1,
                  }}>
                    {s.cta} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section ref={catRef} style={{ padding: '80px 24px', background: C.ground }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 28, textAlign: 'center' }}>
            Browse by category
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
            opacity: catVis ? 1 : 0, transform: catVis ? 'none' : 'translateY(12px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            {CATEGORIES.map((c) => (
              <Link key={c.name} to="/auth/register" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px',
                background: '#fff', border: `1.5px solid ${C.border}`,
                borderRadius: 100, fontSize: 14, fontWeight: 500, color: C.text,
                textDecoration: 'none',
                transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = C.accent
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(51,65,85,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
              }}
              >
                <span style={{ fontSize: 16 }}>{c.icon}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section ref={featRef} style={{ background: C.ground2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.amber, marginBottom: 12 }}>
            Why Operalyn
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 700, letterSpacing: '-0.02em', color: C.text,
            marginBottom: 48, lineHeight: 1.2, maxWidth: 480,
          }}>
            Built for how professional work actually happens.
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20,
            opacity: featVis ? 1 : 0, transform: featVis ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '28px 24px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR FREELANCERS ──────────────────────────────── */}
      <section ref={flRef} style={{
        background: '#0F172A', padding: '88px 24px',
      }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
          opacity: flVis ? 1 : 0, transform: flVis ? 'none' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34D399', marginBottom: 16 }}>
              For freelancers
            </p>
            <h2 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px, 3vw, 44px)',
              fontWeight: 700, letterSpacing: '-0.025em', color: '#F8FAFC',
              lineHeight: 1.15, marginBottom: 20,
            }}>
              Your skills have<br />a market.<br />
              <span style={{ color: '#94A3B8', fontWeight: 400 }}>Find it here.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.65, marginBottom: 32 }}>
              Browse projects, submit proposals, deliver work, and get paid — all on one platform. No bidding wars. Clear milestones. INR payouts.
            </p>
            <Link to="/auth/register" style={{
              display: 'inline-block',
              padding: '13px 28px', fontSize: 15, fontWeight: 700,
              background: '#34D399', color: '#064E3B',
              textDecoration: 'none', borderRadius: 10,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Create a freelancer profile
            </Link>
          </div>

          {/* Freelancer benefit list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Browse real projects', 'Filter by category, budget, and skill. Every listing has a budget range — no fishing expeditions.'],
              ['Milestone-based work', 'Agree on deliverables upfront. No ambiguous scope. Get paid per milestone, not when the client feels like it.'],
              ['Your profile is your portfolio', 'Showcase work samples, display verified reviews, and build a reputation that follows you across projects.'],
            ].map(([title, body]) => (
              <div key={title} style={{
                display: 'flex', gap: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '18px 20px',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#064E3B', shrink: 0, flexShrink: 0, marginTop: 1,
                }}>✓</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: C.ground, textAlign: 'center' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(30px, 4vw, 46px)',
            fontWeight: 700, letterSpacing: '-0.025em', color: C.text,
            lineHeight: 1.15, marginBottom: 16,
          }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.65, marginBottom: 40 }}>
            No setup fee. No monthly subscription. You pay {commissionRate}% commission only when work is successfully completed.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link to="/auth/register" style={{
              padding: '14px 32px', fontSize: 15, fontWeight: 700,
              background: C.accent, color: '#fff',
              textDecoration: 'none', borderRadius: 10,
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(51,65,85,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)' }}
            >
              Hire a freelancer
            </Link>
            <Link to="/auth/register" style={{
              padding: '14px 32px', fontSize: 15, fontWeight: 600,
              border: `1.5px solid ${C.border}`, color: C.text, background: '#fff',
              textDecoration: 'none', borderRadius: 10,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#94A3B8'}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              Find work
            </Link>
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>
            Create an account in under 2 minutes.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 24px',
        background: '#F8FAFC',
      }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: C.accent }}>Operalyn</span>
          <p style={{ fontSize: 12, color: C.muted }}>
            © {new Date().getFullYear()} Operalyn Freelance Network Services Pvt. Ltd.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/auth/register" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Terms</Link>
            <Link to="/auth/register" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Privacy</Link>
            <Link to="/auth/login"    style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </footer>

      {/* prefers-reduced-motion override */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
        @media (max-width: 720px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
