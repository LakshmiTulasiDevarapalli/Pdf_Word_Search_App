"use client"

import Link from "next/link"
import { FileSearch, Upload, Search, FileOutput } from "lucide-react"
import { useEffect, useRef } from "react"

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

export function FeaturesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", background: "#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        .royal-title { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes crownPulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(201,168,76,0.2); }
          50% { box-shadow: 0 4px 24px rgba(201,168,76,0.45); }
        }

        .animate-fade-up { animation: fadeUp 0.7s ease forwards; }
        .anim-d1 { animation: fadeUp 0.7s ease 0.1s both; }
        .anim-d2 { animation: fadeUp 0.7s ease 0.25s both; }
        .anim-d3 { animation: fadeUp 0.7s ease 0.4s both; }

        .royal-gradient-text {
          background: linear-gradient(135deg, #1a2e6e 0%, #4c1d95 60%, #1a2e6e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
        }
        .btn-royal:hover { box-shadow: 0 8px 30px rgba(26,46,110,0.45); transform: translateY(-1px); }

        .gold-divider {
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #c9a84c, #f5d06e, #c9a84c, transparent);
          border: none;
          margin: 0;
        }

        .header-bar {
          border-bottom: 1px solid rgba(201,168,76,0.2);
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
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
            <Link
              href="/features"
              className="animate-fade-up text-sm font-semibold transition-colors"
              style={{ color: "#b8860b", borderBottom: "2px solid #c9a84c", paddingBottom: "2px" }}
            >
              Features
            </Link>
            <Link href="/login" className="btn-royal animate-fade-up rounded-xl px-7 py-2.5 text-sm font-semibold">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Features Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-10 pb-6 md:pt-16 md:pb-8 flex-1">

        {/* Heading */}
        <div className="text-center mb-14 anim-d1">
          <h2 className="royal-title text-4xl font-black royal-gradient-text mb-4">
            Everything you need for PDF analysis
          </h2>
          <p className="max-w-2xl mx-auto text-base" style={{ color: "#6b7280" }}>
            Powerful features designed to transform how you work with documents
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 anim-d3">
          {[
            {
              icon: Upload,
              title: "Large File Support",
              desc: "Upload PDF files up to 5TB in size. No matter how large your document, we process it efficiently with our powerful engine.",
              accent: "#1a2e6e",
            },
            {
              icon: Search,
              title: "Smart Search",
              desc: "Find exact keyword matches across all documents instantly. View results with full context and highlighting.",
              accent: "#4c1d95",
            },
            {
              icon: FileOutput,
              title: "Export Reports",
              desc: "Generate professional Word documents with all your findings. Perfect for sharing insights with your team.",
              accent: "#b8860b",
            },
          ].map(({ icon: Icon, title, desc, accent }) => (
            <div key={title} className="feature-card rounded-2xl p-8">
              <div className="h-0.5 w-10 rounded-full mb-6" style={{ background: `linear-gradient(90deg, ${accent}, #c9a84c)` }} />
              <div className="mb-5 inline-flex p-3 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
                <Icon className="size-6" style={{ color: accent }} />
              </div>
              <h3 className="royal-title text-xl font-bold mb-3" style={{ color: "#111827" }}>{title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: "#6b7280" }}>{desc}</p>
            </div>
          ))}
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
            <div className="flex items-center gap-6 text-sm font-medium" style={{ color: "#9ca3af" }}>
              {["Privacy", "Terms", "Contact"].map(l => (
                <Link key={l} href="#" className="transition-colors hover:text-amber-700">{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}