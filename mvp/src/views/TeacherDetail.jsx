// Vista de detalle de un profesor individual
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ArrowLeft, Mail, Calendar, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * TeacherDetail - Vista detallada de un profesor
 * Muestra información completa, exámenes creados y estadísticas
 */
const TeacherDetail = () => {
  // Hook para navegación entre páginas
  const navigate = useNavigate();

  // Datos de ejemplo del profesor
  const teacher = {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@email.com",
    joinDate: "01/09/2023",
    examsCreated: 8,
    totalStudents: 54,
  };

  // Exámenes creados por el profesor
  const examsCreated = [
    { id: 1, title: "SQL Básico - SELECT", students: 24, avgScore: 82, status: "Activo" },
    { id: 2, title: "JOIN y Relaciones", students: 18, avgScore: 75, status: "Activo" },
    { id: 3, title: "Funciones Agregadas", students: 12, avgScore: 88, status: "Cerrado" },
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
          onClick={() => navigate("/dashboard/admin")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al panel
        </Button>

        {/* Información principal del profesor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{teacher.name}</CardTitle>
            <CardDescription>Información del profesor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Columna izquierda - Datos personales */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de ingreso</p>
                    <p className="font-medium">{teacher.joinDate}</p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Estadísticas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Exámenes creados</p>
                    <p className="font-medium">{teacher.examsCreated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total estudiantes</p>
                    <p className="font-medium text-primary">{teacher.totalStudents}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de exámenes creados */}
        <Card>
          <CardHeader>
            <CardTitle>Exámenes Creados</CardTitle>
            <CardDescription>Todos los exámenes creados por este profesor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examsCreated.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  {/* Información del examen */}
                  <div>
                    <h3 className="font-semibold text-foreground">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.students} estudiantes · Promedio: {exam.avgScore}%
                    </p>
                  </div>
                  
                  {/* Estado del examen */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        exam.status === "Activo"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {exam.status}
                    </span>
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

export default TeacherDetail;
