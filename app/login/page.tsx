"use client"
// app/login/page.tsx — real Supabase Auth sign-in

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileSearch, Mail, Lock, ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase" // your existing client
import { recordAuditEvent } from "@/lib/login-audit"

/* ── ParticleCanvas (unchanged) ─────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let animationId: number
    const PARTICLE_COUNT = 80
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)
    class Particle {
      x: number; y: number; vx: number; vy: number; radius: number; opacity: number; color: string
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 2 + 0.5; this.opacity = Math.random() * 0.3 + 0.08
        this.color = ["#c9a84c","#1a2e6e","#6b21a8","#b8860b","#4c1d95","#1e3a8a"][Math.floor(Math.random()*6)]
      }
      update() {
        this.x += this.vx; this.y += this.vy
        if (this.x < 0) this.x = canvas.width; if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height; if (this.y > canvas.height) this.y = 0
      }
      draw() {
        ctx!.save(); ctx!.globalAlpha = this.opacity; ctx!.fillStyle = this.color
        ctx!.shadowBlur = 8; ctx!.shadowColor = this.color
        ctx!.beginPath(); ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx!.fill(); ctx!.restore()
      }
    }
    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle())
    let patternOffset = 0
    const drawOrnatePattern = () => {
      patternOffset += 0.0005
      const spacing = 60; ctx.save()
      for (let x = 0; x < canvas.width + spacing; x += spacing)
        for (let y = 0; y < canvas.height + spacing; y += spacing) {
          const wave = Math.sin(patternOffset + x * 0.01 + y * 0.01) * 0.5 + 0.5
          ctx.globalAlpha = 0.025 + wave * 0.025; ctx.fillStyle = "#c9a84c"
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI/4); ctx.fillRect(-3,-3,6,6); ctx.restore()
        }
      ctx.restore()
    }
    let bloomOffset = 0
    const drawBlooms = () => {
      bloomOffset += 0.002
      const g1 = ctx.createRadialGradient(canvas.width*.08,canvas.height*.05,0,canvas.width*.08,canvas.height*.05,canvas.width*.4)
      g1.addColorStop(0,`hsla(43,74%,60%,${0.07+Math.sin(bloomOffset)*.02})`); g1.addColorStop(1,"transparent")
      ctx.fillStyle=g1; ctx.fillRect(0,0,canvas.width,canvas.height)
      const g2 = ctx.createRadialGradient(canvas.width*.92,canvas.height*.08,0,canvas.width*.92,canvas.height*.08,canvas.width*.35)
      g2.addColorStop(0,`hsla(270,80%,50%,${0.06+Math.cos(bloomOffset*1.2)*.02})`); g2.addColorStop(1,"transparent")
      ctx.fillStyle=g2; ctx.fillRect(0,0,canvas.width,canvas.height)
    }
    const drawConnections = (parts: Particle[]) => {
      const maxDist=110
      for (let i=0;i<parts.length;i++) for (let j=i+1;j<parts.length;j++) {
        const dx=parts[i].x-parts[j].x, dy=parts[i].y-parts[j].y, dist=Math.sqrt(dx*dx+dy*dy)
        if (dist<maxDist) {
          ctx.save(); ctx.globalAlpha=(1-dist/maxDist)*0.1; ctx.strokeStyle="#c9a84c"; ctx.lineWidth=0.5
          ctx.beginPath(); ctx.moveTo(parts[i].x,parts[i].y); ctx.lineTo(parts[j].x,parts[j].y); ctx.stroke(); ctx.restore()
        }
      }
    }
    const render = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,canvas.width,canvas.height)
      drawOrnatePattern(); drawBlooms()
      particles.forEach(p=>p.update()); drawConnections(particles); particles.forEach(p=>p.draw())
      animationId = requestAnimationFrame(render)
    }
    render()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize",resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex:0 }} />
}

/* ── Login Page ──────────────────────────────────────────── */
export default function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      setError("Invalid email or password. Please try again.")
      return
    }
const { data: { session } } = await supabase.auth.getSession()
if (session) await recordAuditEvent("LOGIN", email)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily:"'DM Sans',sans-serif", background:"#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        .royal-title { font-family:'Playfair Display',serif; }
        .royal-gradient-text { background:linear-gradient(135deg,#1a2e6e 0%,#4c1d95 60%,#1a2e6e 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .gold-shimmer { background:linear-gradient(90deg,#b8860b,#f5d06e,#c9a84c,#f5d06e,#b8860b); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 4s linear infinite; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .btn-royal { background:linear-gradient(135deg,#1a2e6e,#4c1d95); color:#fff; box-shadow:0 4px 20px rgba(26,46,110,0.3); transition:all 0.2s; }
        .btn-royal:hover { box-shadow:0 8px 30px rgba(26,46,110,0.45); transform:translateY(-1px); }
        .btn-royal:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
        .header-bar { border-bottom:1px solid rgba(201,168,76,0.2); background:rgba(255,255,255,0.92); backdrop-filter:blur(20px); }
        .royal-card { background:rgba(255,255,255,0.92); backdrop-filter:blur(24px); border:1px solid rgba(201,168,76,0.35); box-shadow:0 8px 50px rgba(26,46,110,0.1),0 1px 0 rgba(201,168,76,0.5) inset; }
        .gold-divider { height:1.5px; background:linear-gradient(90deg,transparent,#c9a84c,#f5d06e,#c9a84c,transparent); border:none; margin:0; }
      `}</style>

      <ParticleCanvas />

      {/* Header */}
      <header className="header-bar relative z-10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background:"linear-gradient(135deg,#1a2e6e,#4c1d95)", boxShadow:"0 4px 14px rgba(26,46,110,0.3)" }}>
              <FileSearch className="size-5 text-yellow-300" />
            </div>
            <div className="flex flex-col">
              <span className="royal-title text-xl font-black tracking-wide royal-gradient-text">AICS</span>
              <span className="text-xs tracking-widest uppercase hidden sm:block" style={{ color:"#92400e", letterSpacing:"0.18em", fontSize:"10px" }}>PDF Search Engine</span>
            </div>
          </Link>
          <Link href="/" className="btn-royal rounded-xl px-7 py-2.5 text-sm font-semibold">Back to Home</Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="h-1 w-full rounded-t-2xl" style={{ background:"linear-gradient(90deg,#1a2e6e,#c9a84c,#f5d06e,#c9a84c,#4c1d95)" }} />
              <div className="royal-card rounded-b-2xl rounded-tr-2xl p-8 md:p-10">
                <div className="text-center mb-8">
                  <h1 className="royal-title text-3xl font-black mb-2 royal-gradient-text">Welcome Back</h1>
                  <p className="text-sm" style={{ color:"#6b7280" }}>Sign in to access your PDF search workspace</p>
                </div>

                <form className="space-y-6" onSubmit={handleSignIn}>
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium" style={{ color:"#374151" }}>Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="size-5" style={{ color:"#9ca3af" }} />
                      </div>
                      <input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full rounded-xl px-4 py-3 pl-12 text-sm outline-none transition-all"
                        style={{ background:"#f8f7ff", border:"1px solid rgba(201,168,76,0.28)", color:"#1f2937" }} />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium" style={{ color:"#374151" }}>Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="size-5" style={{ color:"#9ca3af" }} />
                      </div>
                      <input id="password" type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl px-4 py-3 pl-12 text-sm outline-none transition-all"
                        style={{ background:"#f8f7ff", border:"1px solid rgba(201,168,76,0.28)", color:"#1f2937" }} />
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor:"#1a2e6e" }} />
                      <span className="text-sm" style={{ color:"#6b7280" }}>Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm font-medium" style={{ color:"#1a2e6e" }}>Forgot password?</Link>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="rounded-xl px-4 py-3 text-sm" style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" }}>
                      {error}
                    </div>
                  )}

                  <hr className="gold-divider" />

                  <button type="submit" disabled={loading} className="btn-royal group w-full rounded-xl px-6 py-3.5 text-base font-semibold cursor-pointer">
                    <span className="flex items-center justify-center gap-2">
                      {loading ? "Signing in…" : "Sign In"}
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 mt-8" style={{ borderTop:"1px solid rgba(201,168,76,0.22)", background:"rgba(255,255,255,0.97)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileSearch className="size-4" style={{ color:"#1a2e6e" }} />
              <span className="royal-title text-sm font-bold royal-gradient-text">© 2026 AICS.</span>
              <span className="text-sm" style={{ color:"#9ca3af" }}>All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium" style={{ color:"#9ca3af" }}>
              {["Privacy","Terms","Contact"].map(l=>(
                <Link key={l} href="#" className="transition-colors hover:text-amber-700">{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}