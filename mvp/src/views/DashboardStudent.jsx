import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Trophy, Clock, CheckCircle2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardStudent = () => {
    const navigate = useNavigate();
    const { logout, accessToken, user } = useAuth();

    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    async function logout_function() {
        logout();
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        navigate("/");
    }

    // Fetch exams for this student
    useEffect(() => {
        async function fetchExams() {
            try {
                setLoadingExams(true);
                setErrorMsg("");

                const res = await fetch(`${API_URL}/exams`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: "include",
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Error cargando exámenes");
                }

                const data = await res.json().catch(() => []);
                // data esperado: [{ ExamID, Title, StartTime, EndTime, completed, pending }, ...]
                setExams(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("[DashboardStudent] error fetching exams:", err);
                setErrorMsg(err.message || "No se pudieron cargar los exámenes.");
            } finally {
                setLoadingExams(false);
            }
        }

        if (accessToken) {
            fetchExams();
        }
    }, [accessToken]);

    // Derivados
    const availableExams = exams.filter((exam) => exam.pending > 0);
    const completedExams = exams.filter((exam) => exam.completed > 0);

    const totalCompletedExams = completedExams.length;
    const totalPendingExams = availableExams.length;
    const totalExams = exams.length;

    // Progreso general (no es nota, es % de exámenes completados)
    const progressPercentage =
        totalExams > 0 ? Math.round((totalCompletedExams / totalExams) * 100) : 0;

    const formatDate = (isoString) => {
        if (!isoString) return "Sin fecha";
        const date = new Date(isoString);
        return date.toLocaleDateString();
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return "Sin fecha";
        const date = new Date(isoString);
        return date.toLocaleString();
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
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Estudiante: {user?.FullName || "—"}
                        </span>
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
                    <p className="text-muted-foreground">
                        Accede a tus exámenes y revisa tu progreso
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 text-sm text-red-500">
                        {errorMsg}
                    </div>
                )}

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Exámenes Completados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {totalCompletedExams}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Progreso General
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-success">
                                {progressPercentage}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalExams > 0
                                    ? `${totalCompletedExams} de ${totalExams} exámenes completados`
                                    : "Sin exámenes asignados aún."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-warning">
                                {totalPendingExams}
                            </div>
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
                        {loadingExams ? (
                            <p className="text-sm text-muted-foreground">Cargando exámenes...</p>
                        ) : availableExams.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tienes exámenes pendientes en este momento.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {availableExams.map((exam) => (
                                    <div
                                        key={exam.ExamID}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {exam.Title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Inicio: {formatDateTime(exam.StartTime)} • Fin:{" "}
                                                {formatDateTime(exam.EndTime)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Intentos pendientes: {exam.pending}
                                            </p>
                                        </div>
                                        <Button onClick={() => navigate("/exam/take", { state: { examID: exam.ExamID } })}>
                                            Comenzar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        {loadingExams ? (
                            <p className="text-sm text-muted-foreground">Cargando exámenes...</p>
                        ) : completedExams.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Aún no has completado ningún examen.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {completedExams.map((exam) => (
                                    <div
                                        key={exam.ExamID}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-success" />
                                            <div>
                                                <h3 className="font-semibold text-foreground">
                                                    {exam.Title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Completado (según assignments): {exam.completed} vez
                                                    {exam.completed > 1 ? "es" : ""} • Fin:{" "}
                                                    {formatDate(exam.EndTime)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">
                                                    Detalles
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/exams/${exam.ExamID}`)}
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

export default DashboardStudent;
