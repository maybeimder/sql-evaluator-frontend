// Importación de componentes UI y utilidades
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Database, ArrowLeft, Search, UserPlus, Trash2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * StudentsList - Vista para gestionar estudiantes
 * Permite ver, buscar y administrar la lista de estudiantes
 */
const StudentsList = () => {
  // Hook de navegación para volver al dashboard
  const navigate = useNavigate();
  
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo de estudiantes (mock data)
  const mockStudents = [
    { id: 1, name: "Juan Pérez", email: "juan.perez@email.com", exams: 5, avgScore: 8.5, status: "Activo" },
    { id: 2, name: "María García", email: "maria.garcia@email.com", exams: 8, avgScore: 9.2, status: "Activo" },
    { id: 3, name: "Carlos López", email: "carlos.lopez@email.com", exams: 3, avgScore: 7.8, status: "Activo" },
    { id: 4, name: "Ana Martínez", email: "ana.martinez@email.com", exams: 6, avgScore: 8.9, status: "Activo" },
    { id: 5, name: "Luis Rodríguez", email: "luis.rodriguez@email.com", exams: 4, avgScore: 7.2, status: "Inactivo" },
  ];

  // Filtrar estudiantes según el término de búsqueda
  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Cabecera de la aplicación */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
          {/* Botón para volver al dashboard */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/teacher")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Título y descripción */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Estudiantes</h1>
          <p className="text-muted-foreground">Administra y visualiza el progreso de tus estudiantes</p>
        </div>

        {/* Card principal con la tabla de estudiantes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Lista de Estudiantes
                </CardTitle>
                <CardDescription>
                  {filteredStudents.length} estudiantes registrados
                </CardDescription>
              </div>
              {/* Botón para agregar nuevo estudiante */}
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabla de estudiantes */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Exámenes</TableHead>
                  <TableHead>Promedio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mapeo de estudiantes filtrados */}
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {student.email}
                      </div>
                    </TableCell>
                    <TableCell>{student.exams} completados</TableCell>
                    <TableCell>
                      {/* Color condicional según el promedio */}
                      <span
                        className={`font-semibold ${
                          student.avgScore >= 9
                            ? "text-success"
                            : student.avgScore >= 7
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {student.avgScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {/* Badge de estado con color condicional */}
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          student.status === "Activo"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botón para ver detalles del estudiante */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/student/${student.id}`)}
                        >
                          Ver Detalles
                        </Button>
                        {/* Botón para eliminar estudiante */}
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mensaje cuando no hay resultados de búsqueda */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron estudiantes con ese criterio de búsqueda
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentsList;
