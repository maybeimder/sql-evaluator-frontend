import { Button } from "@/Components/ui/button";
import { Database, ArrowLeft, Mail, Calendar, Award, FileText, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data — reemplazar con fetch real cuando el backend esté listo
  const student = {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@uninorte.edu.co",
    enrollmentDate: "15/01/2024",
    examsTaken: 12,
    averageScore: 85,
  };

  const examHistory = [
    { id: 1, exam: "SQL Básico — SELECT", score: 90, date: "20/03/2024", status: "Aprobado" },
    { id: 2, exam: "JOIN y Relaciones", score: 85, date: "18/03/2024", status: "Aprobado" },
    { id: 3, exam: "Funciones Agregadas", score: 62, date: "15/03/2024", status: "Reprobado" },
  ];

  const getScoreStyle = (score) => {
    if (score >= 80) return { color: "#34d399", bg: "rgba(52,211,153,0.1)" };
    if (score >= 60) return { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" };
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)" };
  };

  const getStatusStyle = (status) => {
    if (status === "Aprobado") return { color: "#34d399", bg: "rgba(52,211,153,0.1)" };
    return { color: "#f87171", bg: "rgba(248,113,113,0.1)" };
  };

  const initials = student.name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const avgStyle = getScoreStyle(student.averageScore);

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
            variant="ghost" size="sm"
            onClick={() => navigate("/preview/students")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a estudiantes
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">

        {/* Perfil del estudiante */}
        <div className="bg-card border border-border rounded-xl p-6 mb-5">
          <div className="flex items-start gap-5">
            {/* Avatar grande */}
            <div className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{student.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{student.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Inscrito el {student.enrollmentDate}
                </span>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="flex gap-4">
              <div className="bg-background border border-border rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-xs text-muted-foreground mb-1">Exámenes</p>
                <p className="text-2xl font-bold text-foreground">{student.examsTaken}</p>
              </div>
              <div className="bg-background border border-border rounded-xl p-4 text-center min-w-[100px]">
                <p className="text-xs text-muted-foreground mb-1">Promedio</p>
                <p className="text-2xl font-bold" style={{ color: avgStyle.color }}>
                  {student.averageScore}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de exámenes */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Historial de exámenes</span>
            <span className="text-xs text-muted-foreground ml-1">({examHistory.length})</span>
          </div>

          <div className="divide-y divide-border">
            {examHistory.map(exam => {
              const scoreStyle = getScoreStyle(exam.score);
              const statusStyle = getStatusStyle(exam.status);
              return (
                <div
                  key={exam.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                >
                  {/* Info del examen */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{exam.exam}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fecha: {exam.date}
                    </p>
                  </div>

                  {/* Score */}
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ color: scoreStyle.color, background: scoreStyle.bg }}
                  >
                    {exam.score}%
                  </span>

                  {/* Estado */}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ color: statusStyle.color, background: statusStyle.bg }}
                  >
                    {exam.status}
                  </span>

                  {/* Botón */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Ver detalle
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;