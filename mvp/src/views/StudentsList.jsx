import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Database, ArrowLeft, Search, Mail, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const mockStudents = [
  { id: 1, name: "Juan Pérez", email: "juan.perez@uninorte.edu.co", exams: 5, avgScore: 8.5, status: "Activo" },
  { id: 2, name: "María García", email: "maria.garcia@uninorte.edu.co", exams: 8, avgScore: 9.2, status: "Activo" },
  { id: 3, name: "Carlos López", email: "carlos.lopez@uninorte.edu.co", exams: 3, avgScore: 7.8, status: "Activo" },
  { id: 4, name: "Ana Martínez", email: "ana.martinez@uninorte.edu.co", exams: 6, avgScore: 8.9, status: "Activo" },
  { id: 5, name: "Luis Rodríguez", email: "luis.rodriguez@uninorte.edu.co", exams: 4, avgScore: 6.2, status: "Inactivo" },
];

const getScoreStyle = (score) => {
  if (score >= 9) return { color: "#34d399", bg: "rgba(52,211,153,0.1)" };
  if (score >= 7) return { color: "#6366f1", bg: "rgba(99,102,241,0.1)" };
  return { color: "#f87171", bg: "rgba(248,113,113,0.1)" };
};

const getInitials = (name) =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("");

const StudentsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = mockStudents.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = mockStudents.filter(s => s.status === "Activo").length;
  const avgGeneral = (mockStudents.reduce((sum, s) => sum + s.avgScore, 0) / mockStudents.length).toFixed(1);

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Database className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">QueryLogic</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/preview/teacher")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Gestión de Estudiantes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra y visualiza el progreso de tus estudiantes
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total estudiantes", value: mockStudents.length, color: "text-foreground" },
            { label: "Estudiantes activos", value: activeCount, color: "text-success" },
            { label: "Promedio general", value: avgGeneral, color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Header de la tabla */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Lista de estudiantes
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ({filtered.length})
              </span>
            </div>
            {/* Buscador */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 text-sm h-9"
                style={{
                  background: 'rgba(17,19,31,0.8)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              />
            </div>
          </div>

          {/* Encabezados */}
          <div className="grid grid-cols-[2fr_2.5fr_1fr_1fr_1fr_1fr] px-6 py-3 border-b border-border">
            {["Estudiante", "Email", "Exámenes", "Promedio", "Estado", ""].map((h, i) => (
              <span key={i} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {h}
              </span>
            ))}
          </div>

          {/* Filas */}
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No se encontraron estudiantes con ese criterio
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(student => {
                const scoreStyle = getScoreStyle(student.avgScore);
                const initials = getInitials(student.name);
                return (
                  <div
                    key={student.id}
                    className="grid grid-cols-[2fr_2.5fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center hover:bg-muted/20 transition-colors"
                  >
                    {/* Nombre con avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {initials}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {student.name}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-sm truncate">{student.email}</span>
                    </div>

                    {/* Exámenes */}
                    <span className="text-sm text-muted-foreground">
                      {student.exams} completados
                    </span>

                    {/* Promedio */}
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded-full w-fit"
                      style={{ color: scoreStyle.color, background: scoreStyle.bg }}
                    >
                      {student.avgScore.toFixed(1)}
                    </span>

                    {/* Estado */}
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full w-fit"
                      style={student.status === "Activo"
                        ? { color: "#34d399", background: "rgba(52,211,153,0.1)" }
                        : { color: "#7c7fa8", background: "rgba(124,127,168,0.1)" }
                      }
                    >
                      {student.status}
                    </span>

                    {/* Acción (cambiar onClick a /student/:id cuando se tenga el backend)*/}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/preview/student/${student.id}`)}
                        className="gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
                      >
                        Ver detalles
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsList;