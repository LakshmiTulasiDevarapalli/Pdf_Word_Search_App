"use client"

import Link from "next/link"
import { FileSearch, Search, Shield, Clock, X, Mail, Phone } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    const PARTICLE_COUNT = 80

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    class Particle {
      x: number; y: number; vx: number; vy: number
      radius: number; opacity: number; color: string

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.3 + 0.08
        const colors = ["#c9a84c", "#1a2e6e", "#6b21a8", "#b8860b", "#4c1d95", "#1e3a8a"]
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx; this.y += this.vy
        if (this.x < 0) this.x = canvas!.width
        if (this.x > canvas!.width) this.x = 0
        if (this.y < 0) this.y = canvas!.height
        if (this.y > canvas!.height) this.y = 0
      }

      draw() {
        ctx!.save()
        ctx!.globalAlpha = this.opacity
        ctx!.fillStyle = this.color
        ctx!.shadowBlur = 8
        ctx!.shadowColor = this.color
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.restore()
      }
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => new Particle())

    let patternOffset = 0
    const drawOrnatePattern = () => {
      patternOffset += 0.0005
      const spacing = 60
      ctx.save()
      for (let x = 0; x < canvas.width + spacing; x += spacing) {
        for (let y = 0; y < canvas.height + spacing; y += spacing) {
          const wave = Math.sin(patternOffset + x * 0.01 + y * 0.01) * 0.5 + 0.5
          ctx.globalAlpha = 0.025 + wave * 0.025
          ctx.fillStyle = "#c9a84c"
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-3, -3, 6, 6)
          ctx.restore()
        }
      }
      ctx.restore()
    }

    let bloomOffset = 0
    const drawBlooms = () => {
      bloomOffset += 0.002
      const g1 = ctx.createRadialGradient(canvas.width * 0.08, canvas.height * 0.05, 0, canvas.width * 0.08, canvas.height * 0.05, canvas.width * 0.4)
      g1.addColorStop(0, `hsla(43, 74%, 60%, ${0.07 + Math.sin(bloomOffset) * 0.02})`)
      g1.addColorStop(1, "transparent")
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const g2 = ctx.createRadialGradient(canvas.width * 0.92, canvas.height * 0.08, 0, canvas.width * 0.92, canvas.height * 0.08, canvas.width * 0.35)
      g2.addColorStop(0, `hsla(270, 80%, 50%, ${0.06 + Math.cos(bloomOffset * 1.2) * 0.02})`)
      g2.addColorStop(1, "transparent")
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const g3 = ctx.createRadialGradient(canvas.width * 0.5, canvas.height, 0, canvas.width * 0.5, canvas.height, canvas.width * 0.45)
      g3.addColorStop(0, `hsla(225, 70%, 35%, ${0.05 + Math.sin(bloomOffset * 0.8) * 0.02})`)
      g3.addColorStop(1, "transparent")
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const drawConnections = (parts: Particle[]) => {
      const maxDist = 110
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x
          const dy = parts[i].y - parts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            ctx.save()
            ctx.globalAlpha = (1 - dist / maxDist) * 0.1
            ctx.strokeStyle = "#c9a84c"
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(parts[i].x, parts[i].y)
            ctx.lineTo(parts[j].x, parts[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawOrnatePattern()
      drawBlooms()
      particles.forEach(p => p.update())
      drawConnections(particles)
      particles.forEach(p => p.draw())
      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }} />
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,14,40,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "#fff",
          boxShadow: "0 32px 80px rgba(26,46,110,0.22), 0 0 0 1px rgba(201,168,76,0.25)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full flex-shrink-0" style={{ background: "linear-gradient(90deg, #1a2e6e, #c9a84c, #f5d06e, #c9a84c, #4c1d95)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: "linear-gradient(135deg, #1a2e6e, #4c1d95)" }}>
              <FileSearch className="size-4 text-yellow-300" />
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#92400e", fontSize: "10px", letterSpacing: "0.18em" }}>AICS PDF Search Engine</p>
              <h2 className="royal-title text-xl font-black royal-gradient-text">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ background: "rgba(26,46,110,0.07)", color: "#1a2e6e" }}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-6 flex-1" style={{ color: "#374151" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Privacy Page ─────────────────────────────────────────────────────────────
function PrivacyContent() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-7">
      <h3 className="royal-title font-bold text-base mb-2" style={{ color: "#1a2e6e" }}>{title}</h3>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: "#4b5563" }}>{children}</div>
    </div>
  )
  return (
    <div>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "#6b7280" }}>
        <strong style={{ color: "#1a2e6e" }}>Effective Date: January 1, 2026 · Last Updated: March 1, 2026</strong>
        <br />
        At AICS, your privacy is not an afterthought — it is the foundation of everything we build. This policy explains how we collect, use, and protect your data.
      </p>

      <hr className="gold-divider mb-6" />

      <Section title="1. Information We Collect">
        <p><strong>Account data:</strong> When you register, we collect your name, email address, and encrypted password.</p>
        <p><strong>Documents you upload:</strong> PDF files are processed entirely in-memory for search and analysis. We do not store your document contents on our servers beyond the active session unless you explicitly enable cloud sync.</p>
        <p><strong>Usage data:</strong> We collect anonymised analytics (page visits, feature usage) to improve the product. This data cannot be linked back to individual users.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your data solely to operate and improve AICS. We do not sell, rent, or trade your personal information to third parties under any circumstances.</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Deliver and personalise the AICS experience</li>
          <li>Send product updates and security alerts (opt-out available)</li>
          <li>Diagnose technical issues and improve performance</li>
          <li>Meet legal obligations where applicable</li>
        </ul>
      </Section>

      <Section title="3. Document Security">
        <p>All uploaded PDFs are encrypted in transit using TLS 1.3. Files processed through our engine are purged from temporary storage within 60 minutes of session end. Enterprise customers may configure zero-retention mode for maximum compliance.</p>
      </Section>

      <Section title="4. Cookies & Tracking">
        <p>We use essential cookies for authentication and session management. Optional analytics cookies (Google Analytics 4) can be declined via our cookie banner or your browser settings. We do not use advertising or cross-site tracking cookies.</p>
      </Section>

      <Section title="5. Your Rights">
        <p>Under GDPR, CCPA, and similar regulations you have the right to access, correct, export, or delete your data at any time. Submit requests to <span style={{ color: "#1a2e6e", fontWeight: 600 }}>privacy@aics.ai</span>. We respond within 30 days.</p>
      </Section>

      <Section title="6. Data Retention">
        <p>Account data is retained for the lifetime of your account plus 90 days after deletion to comply with accounting obligations. Uploaded document data follows the session-purge policy described in Section 3.</p>
      </Section>

      <Section title="7. Changes to This Policy">
        <p>We will notify registered users by email at least 14 days before any material changes take effect. Continued use after that date constitutes acceptance.</p>
      </Section>

      <p className="text-xs mt-6" style={{ color: "#9ca3af" }}>Questions? Contact our Data Protection Officer at <strong>dpo@aics.ai</strong>.</p>
    </div>
  )
}

// ─── Terms Page ───────────────────────────────────────────────────────────────
function TermsContent() {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-7">
      <h3 className="royal-title font-bold text-base mb-2" style={{ color: "#1a2e6e" }}>{title}</h3>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: "#4b5563" }}>{children}</div>
    </div>
  )
  return (
    <div>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "#6b7280" }}>
        <strong style={{ color: "#1a2e6e" }}>Effective Date: January 1, 2026</strong>
        <br />
        Please read these Terms of Service carefully before using the AICS platform. By accessing or using our services you agree to be bound by these terms.
      </p>

      <hr className="gold-divider mb-6" />

      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using any AICS service you confirm that you are at least 16 years old and have the legal authority to enter into this agreement on behalf of yourself or your organisation.</p>
      </Section>

      <Section title="2. Permitted Use">
        <p>AICS grants you a limited, non-exclusive, non-transferable licence to access and use the platform for lawful document search and analysis. You may not:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Reverse-engineer, decompile, or extract our proprietary search algorithms</li>
          <li>Upload documents that violate third-party intellectual property rights</li>
          <li>Use the service to process classified government documents without an Enterprise agreement</li>
          <li>Resell or sublicence access without written approval</li>
        </ul>
      </Section>

      <Section title="3. Intellectual Property">
        <p>You retain full ownership of any documents you upload. AICS retains ownership of the platform, its search engine, UI, and all underlying technology. Nothing in these terms transfers IP rights either way beyond the scope explicitly stated.</p>
      </Section>

      <Section title="4. Service Availability">
        <p>We target 99.9% monthly uptime. Scheduled maintenance windows are announced 48 hours in advance via our status page at <span style={{ color: "#1a2e6e", fontWeight: 600 }}>status.aics.ai</span>. Downtime credits are available for Enterprise plans per the SLA addendum.</p>
      </Section>

      <Section title="5. Payment & Billing">
        <p>Paid plans are billed monthly or annually in advance. All fees are non-refundable except where required by law. You may cancel at any time; cancellation takes effect at the end of the current billing period. We reserve the right to adjust pricing with 30 days notice.</p>
      </Section>

      <Section title="6. Limitation of Liability">
        <p>To the maximum extent permitted by law, AICS's total liability for any claim arising from these terms or use of the service is limited to the fees you paid in the 12 months preceding the claim. We are not liable for indirect, consequential, or punitive damages.</p>
      </Section>

      <Section title="7. Governing Law">
        <p>These terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law provisions. Disputes shall be resolved by binding arbitration under AAA Commercial Rules, except for injunctive relief which may be sought in courts of competent jurisdiction.</p>
      </Section>

      <Section title="8. Termination">
        <p>Either party may terminate the agreement at any time. AICS may suspend accounts that violate these terms with or without notice depending on severity. Upon termination, your data will be deleted per our Privacy Policy retention schedule.</p>
      </Section>

      <p className="text-xs mt-6" style={{ color: "#9ca3af" }}>For legal enquiries: <strong>legal@aics.ai</strong></p>
    </div>
  )
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
function ContactContent() {
  return (
    <div>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "#6b7280" }}>
        Have a question or need support? Reach out to us directly — we're happy to help.
      </p>

      <hr className="gold-divider mb-6" />

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <Mail className="size-6" />, label: "Email", value: "hello@aics.ai", sub: "We reply within 4 business hours" },
          { icon: <Phone className="size-6" />, label: "Phone", value: "+1 (800) 247-2427", sub: "Mon–Fri, 9 AM – 6 PM EST" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: "#f8f7ff", border: "1px solid rgba(201,168,76,0.28)" }}>
            <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-4" style={{ background: "linear-gradient(135deg, #1a2e6e, #4c1d95)" }}>
              <span style={{ color: "#fbbf24" }}>{c.icon}</span>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#92400e", letterSpacing: "0.12em" }}>{c.label}</p>
            <p className="text-base font-semibold mb-1" style={{ color: "#1a2e6e" }}>{c.value}</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Features Content ─────────────────────────────────────────────────────────
function FeaturesContent() {
  const featureList = [
    {
      title: "Large File Support",
      desc: "Upload PDF files up to 5TB in size. No matter how large your document, we process it efficiently with our powerful engine.",
      accent: "#1a2e6e",
      emoji: "📤",
    },
    {
      title: "Smart Search",
      desc: "Find exact keyword matches across all documents instantly. View results with full context and highlighting.",
      accent: "#4c1d95",
      emoji: "🔍",
    },
    {
      title: "Export Reports",
      desc: "Generate professional Word documents with all your findings. Perfect for sharing insights with your team.",
      accent: "#b8860b",
      emoji: "📄",
    },
  ]
  return (
    <div>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "#6b7280" }}>
        Powerful features designed to transform how you work with documents.
      </p>
      <hr className="gold-divider mb-6" />
      <div className="space-y-4">
        {featureList.map(({ title, desc, accent, emoji }) => (
          <div key={title} className="feature-card rounded-2xl p-6 flex gap-5 items-start">
            <div className="flex-shrink-0 inline-flex p-3 rounded-xl text-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
              {emoji}
            </div>
            <div>
              <div className="h-0.5 w-8 rounded-full mb-2" style={{ background: `linear-gradient(90deg, ${accent}, #c9a84c)` }} />
              <h3 className="royal-title text-base font-bold mb-1" style={{ color: "#111827" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export function LandingPage() {
  const [activeModal, setActiveModal] = useState<"Privacy" | "Terms" | "Contact" | "Features" | null>(null)

  const modalContent: Record<string, { title: string; component: React.ReactNode }> = {
    Privacy: { title: "Privacy Policy", component: <PrivacyContent /> },
    Terms: { title: "Terms of Service", component: <TermsContent /> },
    Contact: { title: "Contact Us", component: <ContactContent /> },
    Features: { title: "Features", component: <FeaturesContent /> },
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", background: "#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        .royal-title { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes crownPulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(201,168,76,0.2); }
          50% { box-shadow: 0 4px 24px rgba(201,168,76,0.45); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
        .anim-d1 { animation: fadeUp 0.7s ease 0.1s both; }
        .anim-d2 { animation: fadeUp 0.7s ease 0.25s both; }
        .anim-d3 { animation: fadeUp 0.7s ease 0.4s both; }
        .anim-d4 { animation: fadeUp 0.7s ease 0.55s both; }
        .animate-float { animation: float 5s ease-in-out 0.8s infinite; }
        .animate-spin { animation: spin 0.8s linear infinite; }

        .gold-shimmer {
          background: linear-gradient(90deg, #b8860b, #f5d06e, #c9a84c, #f5d06e, #b8860b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .royal-gradient-text {
          background: linear-gradient(135deg, #1a2e6e 0%, #4c1d95 60%, #1a2e6e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .royal-card {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(201,168,76,0.35);
          box-shadow: 0 8px 50px rgba(26,46,110,0.1), 0 1px 0 rgba(201,168,76,0.5) inset;
        }

        .feature-card {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(201,168,76,0.22);
          box-shadow: 0 2px 20px rgba(26,46,110,0.06);
          transition: all 0.25s;
        }
        .feature-card:hover {
          border-color: rgba(201,168,76,0.5);
          box-shadow: 0 8px 36px rgba(76,29,149,0.13);
          transform: translateY(-4px);
        }

        .btn-royal {
          background: linear-gradient(135deg, #1a2e6e, #4c1d95);
          color: #fff;
          box-shadow: 0 4px 20px rgba(26,46,110,0.3);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-royal:hover { box-shadow: 0 8px 30px rgba(26,46,110,0.45); transform: translateY(-1px); }

        .gold-divider {
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #c9a84c, #f5d06e, #c9a84c, transparent);
          border: none;
          margin: 0;
        }

        .result-item {
          border-left: 2px solid rgba(201,168,76,0.35);
          transition: all 0.2s;
        }
        .result-item:hover { border-left-color: #c9a84c; }

        .crown-badge {
          background: linear-gradient(135deg, #fef9ec, #fef3c7);
          border: 1px solid rgba(201,168,76,0.4);
          animation: crownPulse 3s ease-in-out infinite;
        }

        .stat-num {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(135deg, #1a2e6e, #4c1d95);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-bar {
          border-bottom: 1px solid rgba(201,168,76,0.2);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
        }

        .footer-link {
          transition: color 0.18s;
        }
        .footer-link:hover {
          color: #b45309 !important;
        }
      `}</style>

      <ParticleCanvas />

      {/* Header */}
      <header className="header-bar relative z-10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 animate-fade-up">
            <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #1a2e6e, #4c1d95)", boxShadow: "0 4px 14px rgba(26,46,110,0.3)" }}>
              <FileSearch className="size-5 text-yellow-300" />
            </div>
            <div className="flex flex-col">
              <span className="royal-title text-xl font-black tracking-wide royal-gradient-text">AICS</span>
              <span className="text-xs tracking-widest uppercase hidden sm:block" style={{ color: "#92400e", letterSpacing: "0.18em", fontSize: "10px" }}>PDF Search Engine</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setActiveModal("Features")}
              className="animate-fade-up text-sm font-semibold transition-colors bg-transparent border-none cursor-pointer p-0"
              style={{ color: "#1a2e6e", borderBottom: "2px solid transparent", paddingBottom: "2px", fontFamily: "inherit" }}
            >
              Features
            </button>
            <Link href="/login" className="btn-royal animate-fade-up rounded-xl px-7 py-2.5 text-sm font-semibold">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 md:py-16 flex-1">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">

          {/* Left */}
          <div className="flex-1 space-y-8">
            <div className="crown-badge anim-d1 inline-flex items-center gap-2 rounded-full px-5 py-2.5">
              <span className="text-base">👑</span>
              <span className="text-sm font-semibold" style={{ color: "#92400e" }}>Lightning-fast document analysis</span>
            </div>

            <h1 className="royal-title anim-d1 text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
              <span className="royal-gradient-text">Find Anything</span>
              <br />
              <span className="gold-shimmer">In Your PDFs</span>
            </h1>

            <p className="anim-d2 max-w-lg text-lg leading-relaxed" style={{ color: "#374151" }}>
              Transform how you work with documents. Search through massive PDFs instantly,
              extract insights, and export results — supporting files up to 5TB.
            </p>

            <hr className="gold-divider anim-d2" style={{ maxWidth: "220px" }} />

            <div className="anim-d3 flex items-center gap-8 text-sm font-medium" style={{ color: "#4b5563" }}>
              <div className="flex items-center gap-2">
                <Shield className="size-4" style={{ color: "#1a2e6e" }} />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4" style={{ color: "#4c1d95" }} />
                <span>Save Hours Daily</span>
              </div>
            </div>
          </div>

          {/* Right — Royal Card */}
          <div className="flex-1 anim-d4">
            <div className="animate-float">
              <div className="h-1 w-full rounded-t-2xl" style={{ background: "linear-gradient(90deg, #1a2e6e, #c9a84c, #f5d06e, #c9a84c, #4c1d95)" }} />
              <div className="royal-card rounded-b-2xl rounded-tr-2xl p-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#f8f7ff", border: "1px solid rgba(201,168,76,0.28)" }}>
                    <Search className="size-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search across all documents..."
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                      style={{ color: "#1f2937" }}
                      disabled
                    />
                    <kbd className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: "linear-gradient(135deg, #1a2e6e, #4c1d95)", color: "#fbbf24" }}>⌘K</kbd>
                  </div>
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="result-item rounded-r-xl px-4 py-3 cursor-pointer" style={{ background: "#fafafa" }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <FileSearch className="size-4" style={{ color: "#1a2e6e" }} />
                              <span className="text-sm font-semibold" style={{ color: "#1a2e6e" }}>Document_{i}.pdf</span>
                            </div>
                            <p className="text-xs" style={{ color: "#6b7280" }}>
                              Found <span className="font-bold" style={{ color: "#b8860b" }}>{i * 3}</span> matches on page {i * 2}
                            </p>
                          </div>
                          <div className="h-2 w-2 rounded-full mt-1 animate-pulse" style={{ background: "#c9a84c", boxShadow: "0 0 6px #c9a84c" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 mt-auto" style={{ borderTop: "1px solid rgba(201,168,76,0.22)", background: "rgba(255,255,255,0.97)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileSearch className="size-4" style={{ color: "#1a2e6e" }} />
              <span className="royal-title text-sm font-bold royal-gradient-text">© 2026 AICS.</span>
              <span className="text-sm" style={{ color: "#9ca3af" }}>All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium">
              {(["Privacy", "Terms", "Contact"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setActiveModal(l)}
                  className="footer-link transition-colors cursor-pointer bg-transparent border-none p-0"
                  style={{ color: "#9ca3af", fontFamily: "inherit", fontSize: "14px", fontWeight: 500 }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeModal && (
        <Modal title={modalContent[activeModal].title} onClose={() => setActiveModal(null)}>
          {modalContent[activeModal].component}
        </Modal>
      )}
    </div>
  )
}