import React, { useEffect, useRef } from 'react'
import { Database, Code2, CheckCircle2, Users } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { Button } from '../Components/ui/button';

// Canvas de partículas
const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      // Líneas entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y
          );
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              <Database className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">QueryLogic</span>
          </div>
          <div className="flex gap-3 items-center">
            <Button variant="ghost" onClick={() => navigate("/login")}
              className="hover:bg-white/5 hover:text-primary transition-colors">
              Iniciar Sesión
            </Button>
            <Button onClick={() => navigate("/register")}
              className="hover:scale-105 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95 transition-all duration-200">
              Registrarse
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero con partículas */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center justify-center">
        <ParticlesBackground />

        {/* Glow de fondo */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-10 hover:border-primary/50 transition-colors cursor-default animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
            <span className="text-sm text-muted-foreground">Plataforma educativa para Uninorte</span>
          </div>

          {/* Título con gradiente */}
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight animate-fade-in-up delay-100">
            <span className="text-foreground">Aprende y evalúa </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0px 4px 24px rgba(99,102,241,0.3))'
              }}
            >
              SQL y Pseudocódigo
            </span>
            <span className="text-foreground"> de forma práctica</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Escribe consultas SQL y pseudocódigo, recibe retroalimentación instantánea y haz
            seguimiento de tu progreso académico.
          </p>

          <div className="flex gap-4 justify-center animate-fade-in-up delay-300">
            <Button size="lg" onClick={() => navigate("/register")}
              className="px-8 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all duration-300">
              Comenzar ahora
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}
              className="hover:bg-white/5 hover:text-primary border-white/10 hover:border-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm">
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border mx-8" />

      {/* Features */}
      <section className="container mx-auto px-8 py-16">
        <p className="text-xs font-semibold text-primary text-center tracking-widest uppercase mb-3">
          Funcionalidades
        </p>
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">
          Todo lo que necesitas en un solo lugar
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="group relative glass-card p-6 rounded-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)] hover:border-primary/50 transition-all duration-300 ease-in-out animate-fade-in-up delay-100 overflow-hidden">
            {/* Hover gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative z-10 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Code2 className="h-5 w-5 text-primary group-hover:text-primary-hover transition-colors duration-300" />
            </div>
            <h3 className="relative z-10 text-sm font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">Editor interactivo</h3>
            <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
              Escribe y ejecuta consultas SQL y pseudocódigo en tiempo real con
              retroalimentación instantánea sobre tus resultados.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative glass-card p-6 rounded-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] hover:border-success/50 transition-all duration-300 ease-in-out animate-fade-in-up delay-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative z-10 w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <CheckCircle2 className="h-5 w-5 text-success transition-colors duration-300" />
            </div>
            <h3 className="relative z-10 text-sm font-semibold mb-2 text-foreground group-hover:text-success transition-colors duration-300">Sistema de evaluación</h3>
            <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
              Calificación automática y seguimiento detallado del progreso
              de cada estudiante en cada examen.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative glass-card p-6 rounded-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(167,139,250,0.15)] hover:border-accent/50 transition-all duration-300 ease-in-out animate-fade-in-up delay-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative z-10 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Users className="h-5 w-5 text-accent transition-colors duration-300" />
            </div>
            <h3 className="relative z-10 text-sm font-semibold mb-2 text-foreground group-hover:text-accent transition-colors duration-300">Para educadores</h3>
            <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
              Crea exámenes personalizados, carga bases de datos propias y
              gestiona estudiantes fácilmente.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-4">
        <div className="container mx-auto px-8 text-center text-sm text-muted-foreground">
          <p>© 2026 QueryLogic — Universidad del Norte</p>
        </div>
      </footer>

    </div>
  );
}