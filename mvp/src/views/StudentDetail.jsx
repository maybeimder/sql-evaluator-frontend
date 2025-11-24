// Vista de detalle de un estudiante individual
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ArrowLeft, Mail, Calendar, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * StudentDetail - Vista detallada de un estudiante
 * Muestra información completa, historial de exámenes y estadísticas
 */
const StudentDetail = () => {
  // Hook para navegación entre páginas
  const navigate = useNavigate();

  // Datos de ejemplo del estudiante
  const student = {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    enrollmentDate: "15/01/2024",
    examsTaken: 12,
    averageScore: 85,
  };

  // Historial de exámenes del estudiante
  const examHistory = [
    { id: 1, exam: "SQL Básico - SELECT", score: 90, date: "20/03/2024", status: "Aprobado" },
    { id: 2, exam: "JOIN y Relaciones", score: 85, date: "18/03/2024", status: "Aprobado" },
    { id: 3, exam: "Funciones Agregadas", score: 78, date: "15/03/2024", status: "Aprobado" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Cabecera de la aplicación */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Botón para volver atrás */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/students")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a lista
        </Button>

        {/* Información principal del estudiante */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <CardDescription>Información del estudiante</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Columna izquierda - Datos personales */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de inscripción</p>
                    <p className="font-medium">{student.enrollmentDate}</p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Estadísticas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Exámenes realizados</p>
                    <p className="font-medium">{student.examsTaken}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Promedio general</p>
                    <p className="font-medium text-success">{student.averageScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial de exámenes */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Exámenes</CardTitle>
            <CardDescription>Todos los exámenes realizados por el estudiante</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examHistory.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  {/* Información del examen */}
                  <div>
                    <h3 className="font-semibold text-foreground">{exam.exam}</h3>
                    <p className="text-sm text-muted-foreground">Fecha: {exam.date}</p>
                  </div>
                  
                  {/* Calificación y estado */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg">{exam.score}%</p>
                      <span className="text-sm text-success">{exam.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetail;
