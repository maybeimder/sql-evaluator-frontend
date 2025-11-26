import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, Users, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * DashboardTeacher - Panel principal para profesores
 * Permite gestionar exámenes, estudiantes y bases de datos
 */
const DashboardTeacher = () => {
    const navigate = useNavigate();
    const { logout, user, accessToken } = useAuth();

    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [errorExams, setErrorExams] = useState("");

    async function logout_function() {
        logout();
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        navigate("/");
    }

    useEffect(() => {
        const fetchExams = async () => {
            if (!accessToken) return;

            setLoadingExams(true);
            setErrorExams("");

            try {
                const res = await fetch(`${API_URL}/exams`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: "include",
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Error al cargar los exámenes");
                }

                const data = await res.json();
                // Esperamos algo como:
                // [ { ExamID, Title, StartTime, EndTime, students }, ... ]
                setExams(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("[DashboardTeacher] error fetching exams:", err);
                setErrorExams(err.message || "Error inesperado al cargar los exámenes");
            } finally {
                setLoadingExams(false);
            }
        };

        fetchExams();
    }, [accessToken]);

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
                        <span className="text-sm text-muted-foreground">
                            Profesor: {user?.FullName || "—"}
                        </span>
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
                    <p className="text-muted-foreground">
                        Gestiona tus exámenes, estudiantes y bases de datos
                    </p>
                </div>

                {/* Acciones rápidas */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => navigate("/exam/create")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                Crear Examen
                            </CardTitle>
                            <CardDescription>Nuevo examen con preguntas SQL</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => navigate("/students")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-success" />
                                Ver Estudiantes
                            </CardTitle>
                            <CardDescription>Gestionar lista de estudiantes</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => navigate("/databases")}
                    >
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
                        {errorExams && (
                            <p className="mb-3 text-sm text-red-500">{errorExams}</p>
                        )}

                        {loadingExams ? (
                            <p className="text-sm text-muted-foreground">
                                Cargando exámenes...
                            </p>
                        ) : exams.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Aún no has creado exámenes.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {exams.map((exam) => (
                                    <div
                                        key={exam.ExamID}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        {/* Información del examen */}
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {exam.Title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Inicio:{" "}
                                                {exam.StartTime
                                                    ? new Date(exam.StartTime).toLocaleString()
                                                    : "—"}
                                                {" • "}
                                                Fin:{" "}
                                                {exam.EndTime
                                                    ? new Date(exam.EndTime).toLocaleString()
                                                    : "—"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Estudiantes inscritos: {exam.students ?? 0}
                                            </p>
                                        </div>

                                        {/* Acciones del examen */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(`/teacher/exams/${exam.ExamID}`, {
                                                        state: { examID: exam.ExamID },
                                                    })
                                                }
                                            >
                                                Ver detalles
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardTeacher;
