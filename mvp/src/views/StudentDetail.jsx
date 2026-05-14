import { Button } from "@/Components/ui/button";
import { Database, ArrowLeft, Mail, Calendar, Award, FileText, ChevronRight, GraduationCap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`${API_URL}/users/id/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setStudent(data.user ?? data);
      } catch (err) {
        console.error("[StudentDetail] Error cargando estudiante:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, accessToken]);

  const examHistory = [
    { id: 1, exam: "SQL Básico — SELECT", score: 90, date: "20/03/2024", status: "Aprobado" },
    { id: 2, exam: "JOIN y Relaciones", score: 85, date: "18/03/2024", status: "Aprobado" },
    { id: 3, exam: "Funciones Agregadas", score: 62, date: "15/03/2024", status: "Reprobado" },
  ];

  const getScoreStyle = (score) => {
    if (score >= 80) return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
    if (score >= 60) return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" };
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.2)" };
  };

  const getStatusStyle = (status) => {
    if (status === "Aprobado") return { color: "#34d399", bg: "rgba(52,211,153,0.1)" };
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)" };
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Cargando estudiante...</p>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-destructive">No se pudo cargar el estudiante.</p>
    </div>
  );

  const name = student.Name ?? student.name ?? "—";
  const email = student.Email ?? student.email ?? "—";
  const enrollmentDate = student.CreatedAt
    ? new Date(student.CreatedAt).toLocaleDateString("es-CO")
    : (student.enrollmentDate ?? "—");
  const examsTaken = student.ExamsTaken ?? student.examsTaken ?? 0;
  const averageScore = student.AverageScore ?? student.averageScore ?? 0;

  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const avgStyle = getScoreStyle(averageScore);

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
            onClick={() => navigate("/students")}
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Volver a Estudiantes</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-8 py-10">
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto"
        >
          {/* Perfil del estudiante */}
          <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-10 mb-8 shadow-xl shadow-black/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-500 group-hover:bg-primary/10"></div>
            
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 text-center sm:text-left">
                {/* Avatar grande */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl font-extrabold text-primary flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {initials}
                </div>
                
                {/* Detalles */}
                <div className="flex flex-col justify-center h-full pt-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Perfil del Estudiante</p>
                  <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-muted-foreground">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Mail className="h-4 w-4 opacity-70" />
                      <span className="text-sm font-medium">{email}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span className="text-sm font-medium">Inscrito el {enrollmentDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Rápidas (Cards) */}
              <div className="flex flex-row gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                <div className="flex-1 lg:w-32 bg-black/20 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center hover:bg-black/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-black text-foreground mb-1 leading-none">{examsTaken}</p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Exámenes</p>
                </div>
                
                <div className="flex-1 lg:w-32 bg-black/20 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center hover:bg-black/30 transition-colors relative overflow-hidden">
                  {/* Subtle glow for the average score */}
                  <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${avgStyle.color} 0%, transparent 70%)` }}></div>
                  
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3 relative z-10">
                    <GraduationCap className="h-4 w-4" style={{ color: avgStyle.color }} />
                  </div>
                  <p className="text-3xl font-black mb-1 leading-none relative z-10" style={{ color: avgStyle.color }}>
                    {averageScore}<span className="text-xl">%</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold relative z-10">Promedio</p>
                </div>
              </div>
              
            </div>
          </motion.div>

          {/* Historial de exámenes */}
          <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/10">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-foreground">Historial de Evaluaciones</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Rendimiento detallado en cada examen</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5 hidden sm:inline-block">
                {examHistory.length} registros
              </span>
            </div>

            {/* Encabezados Desktop */}
            <div className="hidden sm:grid grid-cols-[2.5fr_1fr_1fr_auto] px-8 py-3 border-b border-white/5 bg-black/10">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Examen</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Puntaje</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Estado</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-0">Acción</span>
            </div>

            <div className="divide-y divide-white/5">
              {examHistory.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">Sin evaluaciones</h3>
                    <p className="text-sm text-muted-foreground">El estudiante aún no ha completado ningún examen.</p>
                  </div>
              ) : (
                examHistory.map((exam, idx) => {
                    const scoreStyle = getScoreStyle(exam.score);
                    const statusStyle = getStatusStyle(exam.status);
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (idx * 0.05) }}
                            key={exam.id}
                            onClick={() => navigate(`/teacher/exams/${exam.id}/students/${id}`)}
                            className="group flex flex-col sm:grid sm:grid-cols-[2.5fr_1fr_1fr_auto] gap-4 sm:gap-0 items-start sm:items-center px-6 sm:px-8 py-5 hover:bg-white/5 transition-all duration-300 cursor-pointer relative"
                        >
                            {/* Línea indicadora on hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            {/* Info del examen */}
                            <div>
                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{exam.exam}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground opacity-70" />
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {exam.date}
                                    </p>
                                </div>
                            </div>

                            {/* Score */}
                            <div>
                                <span
                                    className="text-xs font-black px-2.5 py-1 rounded-md border inline-block"
                                    style={{ color: scoreStyle.color, background: scoreStyle.bg, borderColor: scoreStyle.border }}
                                >
                                    {exam.score}%
                                </span>
                            </div>

                            {/* Estado */}
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    {exam.status === "Aprobado" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${exam.status === "Aprobado" ? "bg-success" : "bg-destructive"}`}></span>
                                </span>
                                <span className="text-xs font-bold tracking-wide" style={{ color: exam.status === "Aprobado" ? "#34d399" : "#f87171" }}>
                                    {exam.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Botón Acción (Flecha) */}
                            <div className="flex justify-end self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all sm:group-hover:translate-x-1">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDetail;