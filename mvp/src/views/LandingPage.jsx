import React from 'react'

import { Database, Code2, FileText, Users, Plus, LogOut, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { Button } from '../Components/ui/button';




export const LandingPage = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </Button>
            <Button onClick={() => navigate("/register")}>
              Registrarse
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
          Aprende SQL de forma práctica
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma educativa para evaluar conocimientos de SQL con ejercicios interactivos,
          retroalimentación instantánea y seguimiento de progreso.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/register")}>
            Comenzar ahora
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            Ya tengo cuenta
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Editor Interactivo</h3>
            <p className="text-muted-foreground">
              Escribe y ejecuta consultas SQL en tiempo real con retroalimentación instantánea.
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Sistema de Evaluación</h3>
            <p className="text-muted-foreground">
              Calificación automática y seguimiento detallado del progreso de cada estudiante.
            </p>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Para Educadores</h3>
            <p className="text-muted-foreground">
              Crea exámenes personalizados, gestiona estudiantes y analiza resultados fácilmente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-lg mb-8 opacity-90">
            Únete a cientos de estudiantes y profesores que ya usan SQLEvaluator
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/register")}>
            Crear cuenta gratuita
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SQLEvaluator. Plataforma educativa para aprendizaje de SQL.</p>
        </div>
      </footer>
    </div>
  );
}
