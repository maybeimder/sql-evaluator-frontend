import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, ArrowLeft, Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// 🔹 MOCK de datos solo para la UI (luego lo reemplazas con fetch al backend)
const mockExamDetailForTeacher = {
  "1": {
    id: 1,
    title: "SQL Básico - SELECT",
    description: "Examen introductorio sobre sentencias SELECT y filtros básicos.",
    status: "Activo",
    assignedCount: 24,
    answeredCount: 18,
    avgScore: 84,
    students: [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@uninorte.edu.co",
        status: "Completado",
        score: 88,
      },
      {
        id: 2,
        name: "María García",
        email: "maria.garcia@uninorte.edu.co",
        status: "Completado",
        score: 95,
      },
      {
        id: 3,
        name: "Carlos López",
        email: "carlos.lopez@uninorte.edu.co",
        status: "Pendiente",
        score: null,
      },
    ],
  },
  "3": {
    id: 3,
    title: "Funciones Agregadas",
    description: "Evalúa SUM, AVG, COUNT y otras funciones agregadas.",
    status: "Cerrado",
    assignedCount: 12,
    answeredCount: 12,
    avgScore: 82,
    students: [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@uninorte.edu.co",
        status: "Completado",
        score: 85,
      },
      {
        id: 2,
        name: "María García",
        email: "maria.garcia@uninorte.edu.co",
        status: "Completado",
        score: 92,
      },
    ],
  },
};

// 🔹 Lista simulada de todos los estudiantes que el profe puede asignar
const mockAllStudents = [
  { id: 1, name: "Juan Pérez", email: "juan.perez@uninorte.edu.co" },
  { id: 2, name: "María García", email: "maria.garcia@uninorte.edu.co" },
  { id: 3, name: "Carlos López", email: "carlos.lopez@uninorte.edu.co" },
  { id: 4, name: "Ana Martínez", email: "ana.martinez@uninorte.edu.co" },
];

const TeacherExamDetail = () => {
  const { id } = useParams(); // viene de /teacher/exams/:id
  const navigate = useNavigate();

  const exam = mockExamDetailForTeacher[id];

  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            No se encontró información para este examen.
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard/teacher")}>
            Volver al dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Filtrar estudiantes que YA están asignados
  const assignedStudents = exam.students;
  const filteredStudents = assignedStudents.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Opciones del dropdown = todos los estudiantes que todavía no están asignados
  const availableToAssign = mockAllStudents.filter(
    (s) => !assignedStudents.some((as) => as.id === s.id)
  );

  const handleAssignStudent = () => {
    if (!selectedStudentId) return;

    const student = mockAllStudents.find(
      (s) => String(s.id) === String(selectedStudentId)
    );
    if (!student) return;

    // Aquí en realidad llamarías al backend: POST /exams/:id/assign
    console.log("[TeacherExamDetail] Asignar estudiante", student, "al examen", exam.id);

    // Solo UI mock: mostrar que se añadió (en la vida real vendría desde la API)
    exam.students.push({
      id: student.id,
      name: student.name,
      email: student.email,
      status: "Pendiente",
      score: null,
    });

    setSelectedStudentId("");
    setShowAssignPanel(false);
  };

  const getStatusBadgeClasses = (status) => {
    if (status === "Completado") return "bg-success/10 text-success";
    if (status === "Pendiente") return "bg-muted text-muted-foreground";
    if (status === "En progreso") return "bg-primary/10 text-primary";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/teacher")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Información general del examen */}
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription>{exam.description}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  exam.status === "Activo"
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {exam.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {exam.assignedCount} estudiantes inscritos
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Respondieron</p>
              <p className="text-2xl font-bold text-primary">
                {exam.answeredCount} / {exam.assignedCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Promedio general</p>
              <p className="text-2xl font-bold text-success">{exam.avgScore}%</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAssignPanel((prev) => !prev)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir estudiantes
              </Button>
              <p className="text-xs text-muted-foreground max-w-xs text-left md:text-right">
                Asigna nuevos estudiantes a este examen. En producción esto se
                conectará a la lista real de estudiantes del curso.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Panel para asignar estudiantes */}
        {showAssignPanel && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Añadir estudiantes al examen</CardTitle>
              <CardDescription>
                Selecciona un estudiante de la lista y asígnalo a este examen.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 items-center">
              <select
                className="w-full md:flex-1 px-3 py-2 border border-border rounded-md bg-background"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Selecciona un estudiante...</option>
                {availableToAssign.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.email}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAssignStudent}
                disabled={!selectedStudentId}
              >
                Asignar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabla de estudiantes del examen */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Estudiantes de este examen</CardTitle>
                <CardDescription>
                  Revisa quién ha respondido, sus notas y accede al detalle de cada intento.
                </CardDescription>
              </div>
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeClasses(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.status === "Completado" && student.score != null ? (
                        <span
                          className={`font-semibold ${
                            student.score >= 90
                              ? "text-success"
                              : student.score >= 70
                              ? "text-primary"
                              : "text-destructive"
                          }`}
                        >
                          {student.score}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {student.status === "Completado" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/teacher/exams/${exam.id}/students/${student.id}`
                            )
                          }
                        >
                          Ver detalles
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Pendiente de respuesta
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron estudiantes con ese criterio de búsqueda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherExamDetail;
