import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Database, ArrowLeft, Search, Mail, ChevronRight, Users, GraduationCap, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const mockStudents = [
  { id: 1, name: "Juan Pérez", email: "juan.perez@uninorte.edu.co", exams: 5, avgScore: 8.5, status: "Activo" },
  { id: 2, name: "María García", email: "maria.garcia@uninorte.edu.co", exams: 8, avgScore: 9.2, status: "Activo" },
  { id: 3, name: "Carlos López", email: "carlos.lopez@uninorte.edu.co", exams: 3, avgScore: 7.8, status: "Activo" },
  { id: 4, name: "Ana Martínez", email: "ana.martinez@uninorte.edu.co", exams: 6, avgScore: 8.9, status: "Activo" },
  { id: 5, name: "Luis Rodríguez", email: "luis.rodriguez@uninorte.edu.co", exams: 4, avgScore: 6.2, status: "Inactivo" },
];

const getScoreStyle = (score) => {
  if (score >= 9) return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" };
  if (score >= 7) return { color: "#818cf8", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)" };
  return { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" };
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

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background pb-12">

      {/* Navbar */}
      <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">QueryLogic</span>
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => navigate("/dashboard/teacher")}
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Volver al Panel</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-8 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestión Académica</p>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Gestión de Estudiantes</h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Administra y visualiza el progreso de tus estudiantes. Escanea rápidamente sus calificaciones y estados.
            </p>
          </motion.div>

          {/* Stats rápidas */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
            {[
              { label: "Total inscritos", value: mockStudents.length, color: "text-foreground", icon: Users, iconColor: "text-foreground/60", iconBg: "bg-white/5 border-white/10" },
              { label: "Usuarios activos", value: activeCount, color: "text-success", icon: Activity, iconColor: "text-success", iconBg: "bg-success/10 border-success/20" },
              { label: "Promedio general", value: avgGeneral, color: "text-primary", icon: GraduationCap, iconColor: "text-primary", iconBg: "bg-primary/10 border-primary/20" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-4xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Contenedor Principal (Tabla) */}
          <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/20">

            {/* Header de la tabla */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Directorio de estudiantes
                  </h2>
                  <p className="text-xs text-muted-foreground">Mostrando {filtered.length} resultados</p>
                </div>
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 bg-black/40 border-white/10 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl shadow-inner"
                />
              </div>
            </div>

            {/* Tabla Responsive Container */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Encabezados */}
                <div className="grid grid-cols-[2.5fr_2fr_1.5fr_1fr_1fr_1fr] px-8 py-4 border-b border-white/5 bg-black/10">
                  {["Estudiante", "Correo Electrónico", "Exámenes", "Promedio", "Estado", ""].map((h, i) => (
                    <span key={i} className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {h}
                    </span>
                  ))}
                </div>

                {/* Filas */}
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-16 text-center"
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">Sin resultados</h3>
                    <p className="text-sm text-muted-foreground">
                      No se encontraron estudiantes que coincidan con tu búsqueda.
                    </p>
                  </motion.div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filtered.map((student, idx) => {
                      const scoreStyle = getScoreStyle(student.avgScore);
                      const initials = getInitials(student.name);
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={student.id}
                          onClick={() => navigate(`/preview/student/${student.id}`)}
                          className="group grid grid-cols-[2.5fr_2fr_1.5fr_1fr_1fr_1fr] px-8 py-5 items-center hover:bg-white/5 transition-all duration-300 cursor-pointer relative"
                        >
                          {/* Línea indicadora on hover */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          {/* Nombre con avatar */}
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                              {initials}
                            </div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {student.name}
                            </span>
                          </div>

                          {/* Email */}
                          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                            <span className="text-sm truncate font-medium">{student.email}</span>
                          </div>

                          {/* Exámenes */}
                          <span className="text-sm text-muted-foreground font-medium">
                            <span className="text-foreground">{student.exams}</span> resueltos
                          </span>

                          {/* Promedio */}
                          <span
                            className="text-xs font-black px-2.5 py-1 rounded-md w-fit border"
                            style={{ color: scoreStyle.color, background: scoreStyle.bg, borderColor: scoreStyle.border }}
                          >
                            {student.avgScore.toFixed(1)}
                          </span>

                          {/* Estado */}
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              {student.status === "Activo" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${student.status === "Activo" ? "bg-success" : "bg-muted-foreground"}`}></span>
                            </span>
                            <span className="text-xs font-bold tracking-wide" style={{ color: student.status === "Activo" ? "#34d399" : "#7c7fa8" }}>
                              {student.status.toUpperCase()}
                            </span>
                          </div>

                          {/* Acción (Flecha) */}
                          <div className="flex justify-end pr-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:translate-x-1">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentsList;