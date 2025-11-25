import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Trophy, Clock, CheckCircle2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardStudent = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    async function logout_function() {
        logout();
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        }); 
        navigate("/")
    }

    const availableExams = [
        { id: 1, title: "SQL Básico - SELECT", professor: "María González", deadline: "2024-02-15" },
        { id: 2, title: "JOIN y Relaciones", professor: "María González", deadline: "2024-02-20" },
    ];

    const completedExams = [
        { id: 3, title: "Funciones Agregadas", score: 85, date: "2024-01-10" },
        { id: 4, title: "Subconsultas", score: 92, date: "2024-01-05" },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Estudiante: Juan Pérez</span>
                        <Button variant="ghost" size="sm" onClick={logout_function}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mi Panel</h1>
                    <p className="text-muted-foreground">Accede a tus exámenes y revisa tu progreso</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Exámenes Completados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">12</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Promedio General
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-success">87%</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-warning">2</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Exams */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-warning" />
                            Exámenes Disponibles
                        </CardTitle>
                        <CardDescription>Únete a un examen para comenzar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {availableExams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-semibold text-foreground">{exam.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Profesor: {exam.professor} • Vence: {exam.deadline}
                                        </p>
                                    </div>
                                    <Button onClick={() => navigate("/exam/take")}>
                                        Comenzar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Exams */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-success" />
                            Historial de Exámenes
                        </CardTitle>
                        <CardDescription>Revisa tus exámenes anteriores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {completedExams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                        <div>
                                            <h3 className="font-semibold text-foreground">{exam.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Completado el {exam.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-success">{exam.score}%</div>
                                            <div className="text-xs text-muted-foreground">Calificación</div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/exams/${exam.id}`)}>
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

export default DashboardStudent;
