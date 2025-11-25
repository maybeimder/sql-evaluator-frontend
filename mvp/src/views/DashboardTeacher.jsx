// Importación de componentes UI y utilidades
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, Users, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

/**
 * DashboardTeacher - Panel principal para profesores
 * Permite gestionar exámenes, estudiantes y bases de datos
 */
const DashboardTeacher = () => {
    // Hook de navegación para redireccionar entre páginas
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function logout_function() {
        logout();
        await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            credentials: "include"
        });
        navigate("/")
    }


    // Datos de ejemplo de exámenes (mock data)
    const mockExams = [
        { id: 1, title: "SQL Básico - SELECT", students: 24, status: "Activo" },
        { id: 2, title: "JOIN y Relaciones", students: 18, status: "Activo" },
        { id: 3, title: "Funciones Agregadas", students: 12, status: "Cerrado" },
    ];

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
                    {/* Información del usuario y botón de salir */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Profesor: María González</span>
                        <Button variant="ghost" size="sm" onClick={logout_function}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Título y descripción del dashboard */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Panel del Profesor</h1>
                    <p className="text-muted-foreground">Gestiona tus exámenes, estudiantes y bases de datos</p>
                </div>

                {/* Acciones rápidas - Cards clicables para navegación */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Card para crear nuevo examen */}
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/exam/create")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                Crear Examen
                            </CardTitle>
                            <CardDescription>Nuevo examen con preguntas SQL</CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Card para ver y gestionar estudiantes */}
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/students")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-success" />
                                Ver Estudiantes
                            </CardTitle>
                            <CardDescription>Gestionar lista de estudiantes</CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Card para gestionar bases de datos */}
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/databases")}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-accent" />
                                Bases de Datos
                            </CardTitle>
                            <CardDescription>Administrar bases de datos</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Lista de exámenes creados */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Exámenes Creados
                        </CardTitle>
                        <CardDescription>Lista de todos tus exámenes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {/* Mapeo de exámenes para mostrar cada uno */}
                            {mockExams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    {/* Información del examen */}
                                    <div>
                                        <h3 className="font-semibold text-foreground">{exam.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {exam.students} estudiantes inscritos
                                        </p>
                                    </div>
                                    {/* Estado y acciones del examen */}
                                    <div className="flex items-center gap-3">
                                        {/* Badge de estado con color condicional */}
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${exam.status === "Activo"
                                                    ? "bg-success/10 text-success"
                                                    : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {exam.status}
                                        </span>
                                        {/* Botón para ver detalles del examen */}
                                        <Button variant="outline" size="sm">
                                            Ver detalles
                                        </Button>
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

export default DashboardTeacher;
