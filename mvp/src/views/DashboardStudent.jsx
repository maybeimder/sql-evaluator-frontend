import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, CheckCircle2, Play, Database, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardStudent = () => {
    const navigate = useNavigate();
    const { accessToken, user } = useAuth();

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

    useEffect(() => {
        async function fetchExams() {
            try {
                setLoadingExams(true);
                setErrorMsg("");
                const res = await fetch(`${API_URL}/exams`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    credentials: "include",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Error cargando exámenes");
                }
                const data = await res.json().catch(() => []);
                setExams(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("[DashboardStudent] error fetching exams:", err);
                setErrorMsg(err.message || "No se pudieron cargar los exámenes.");
            } finally {
                setLoadingExams(false);
            }
        }
        if (accessToken) fetchExams();
    }, [accessToken]);

    const availableExams = exams.filter((exam) => exam.pending > 0);
    const completedExams = exams.filter((exam) => exam.completed > 0);

    const totalCompletedExams = completedExams.length;
    const totalPendingExams = availableExams.length;
    const totalExams = exams.length;

    const progressPercentage =
        totalExams > 0 ? Math.round((totalCompletedExams / totalExams) * 100) : 0;

    // SCRUM-136 — Puntaje acumulado
    const avgScore = completedExams.length > 0
        ? Math.round(
            completedExams.reduce((sum, e) => sum + (e.score ?? e.avgScore ?? 0), 0)
            / completedExams.length
        )
        : null;

    const formatDate = (isoString) => {
        if (!isoString) return "Sin fecha";
        return new Date(isoString).toLocaleDateString();
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return "Sin fecha";
        return new Date(isoString).toLocaleString();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const getScoreStyle = (score) => ({
        color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171',
        background: score >= 80 ? 'rgba(52,211,153,0.1)' : score >= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
        borderColor: score >= 80 ? 'rgba(52,211,153,0.2)' : score >= 60 ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)',
    });

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Header */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 group-hover:shadow-primary/40 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">QueryLogic</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            Estudiante: <span className="font-medium text-foreground">{user?.FullName || "—"}</span>
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary hover:scale-105 hover:bg-primary/20 transition-all duration-300 cursor-default">
                            {user?.FullName ? user.FullName.split(" ").map(w => w[0]).slice(0, 2).join("") : "E"}
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout_function}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 active:scale-95 transition-all duration-200">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 py-8">

                {/* Título */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Mi Espacio de Estudio</p>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        {user?.FullName ? `Hola, ${user.FullName.split(' ')[0]}` : 'Mi Panel'}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Accede a tus exámenes y revisa tu progreso</p>
                </motion.div>

                {/* Dev preview */}
                <div className="mb-6 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse inline-block"></span>
                        Modo previsualización
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => navigate("/exam/take")}
                            size="sm"
                            variant="outline"
                            className="text-xs border-primary/20 text-primary hover:bg-primary/10 gap-1.5 h-8"
                        >
                            <Play className="h-3 w-3" />
                            Ir al evaluador
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/exams/3`)}
                            className="text-xs border-white/10 text-muted-foreground hover:bg-white/5 h-8"
                        >
                            Ver ExamDetailStudent
                        </Button>
                    </div>
                </div>

                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2"
                    >
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                        {errorMsg}
                    </motion.div>
                )}

                {/* Stats — SCRUM-136/137 */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
                >
                    {/* Exámenes completados */}
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ease-out group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <CheckCircle2 className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    Exámenes Completados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-foreground tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    {totalCompletedExams}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Progreso + Puntaje acumulado — SCRUM-136 */}
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-success/10 transition-all duration-300 ease-out group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <Trophy className="h-4 w-4 text-success opacity-70 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all" />
                                    Progreso General
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-success tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    {progressPercentage}%
                                </div>
                                <div className="w-full bg-muted/30 h-2 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className="bg-success h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 opacity-80">
                                    {totalExams > 0
                                        ? `${totalCompletedExams} de ${totalExams} exámenes completados`
                                        : "Sin exámenes asignados aún."}
                                </p>
                                {avgScore !== null && (
                                    <div className="mt-3 flex items-center gap-2 bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                                        <Trophy className="h-3.5 w-3.5 text-success flex-shrink-0" />
                                        <span className="text-xs text-success font-semibold">
                                            Promedio: {avgScore}%
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Pendientes */}
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="h-full bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-warning/10 transition-all duration-300 ease-out group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/5 rounded-full blur-xl group-hover:bg-warning/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <Clock className="h-4 w-4 text-warning opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    Pendientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-warning tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    {totalPendingExams}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Exámenes disponibles */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="mb-6 bg-card/40 backdrop-blur-md border-white/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-warning/10 rounded-lg">
                                    <Clock className="h-4 w-4 text-warning" />
                                </div>
                                Exámenes Disponibles
                                <span className="ml-2 text-xs font-medium bg-warning/20 text-warning px-2 py-0.5 rounded-full border border-warning/30">
                                    {availableExams.length}
                                </span>
                            </CardTitle>
                            <CardDescription>Únete a un examen para comenzar</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {loadingExams ? (
                                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-sm text-muted-foreground animate-pulse">Cargando exámenes...</p>
                                </div>
                            ) : availableExams.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 text-center flex flex-col items-center justify-center"
                                >
                                    <div className="w-14 h-14 bg-muted/20 rounded-full flex items-center justify-center mb-3">
                                        <Clock className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        No tienes exámenes pendientes en este momento.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ¡Gran trabajo! Estás al día con tus evaluaciones.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                                    {availableExams.map((exam) => (
                                        <motion.div
                                            variants={itemVariants}
                                            key={exam.ExamID}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-md hover:border-white/10 transition-all duration-300"
                                        >
                                            <div className="mb-4 sm:mb-0">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {exam.Title}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5">
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3 opacity-70" />
                                                        <span className="font-medium text-foreground/70">Inicio:</span> {formatDateTime(exam.StartTime)}
                                                    </p>
                                                    <span className="hidden sm:inline text-muted-foreground/30">•</span>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3 w-3 opacity-70" />
                                                        <span className="font-medium text-foreground/70">Fin:</span> {formatDateTime(exam.EndTime)}
                                                    </p>
                                                </div>
                                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-warning/10 border border-warning/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></div>
                                                    <p className="text-[10px] font-medium text-warning uppercase tracking-wider">
                                                        Intentos pendientes: {exam.pending}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => navigate(`/exam/take/${exam.ExamID}`, { state: { examID: exam.ExamID } })}
                                                className="w-full sm:w-auto relative overflow-hidden group/btn hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] active:scale-95 transition-all duration-200"
                                            >
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    Comenzar
                                                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-white/30 transition-colors">
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                                    </div>
                                                </span>
                                            </Button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Historial de exámenes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <Trophy className="h-4 w-4 text-success" />
                                </div>
                                Historial de Exámenes
                            </CardTitle>
                            <CardDescription>Revisa tus exámenes anteriores</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {loadingExams ? (
                                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-sm text-muted-foreground animate-pulse">Cargando exámenes...</p>
                                </div>
                            ) : completedExams.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 text-center flex flex-col items-center justify-center"
                                >
                                    <div className="w-14 h-14 bg-muted/20 rounded-full flex items-center justify-center mb-3">
                                        <Trophy className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        Aún no has completado ningún examen.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                                    {completedExams.map((exam) => (
                                        <motion.div
                                            variants={itemVariants}
                                            key={exam.ExamID}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/10 transition-all duration-300"
                                        >
                                            <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                                                <div className="p-2 bg-success/10 rounded-full flex-shrink-0 mt-1 sm:mt-0 group-hover:scale-110 group-hover:bg-success/20 transition-all duration-300">
                                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {exam.Title}
                                                    </h3>

                                                    {/* SCRUM-137 — Puntaje del examen */}
                                                    {exam.score !== null && exam.score !== undefined && (
                                                        <div
                                                            className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                                                            style={getScoreStyle(exam.score)}
                                                        >
                                                            <Trophy className="h-3 w-3" />
                                                            {exam.score}%
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                                        <p className="text-xs text-muted-foreground">
                                                            <span className="font-medium text-foreground/70">Completado:</span> {exam.completed} vez{exam.completed > 1 ? "es" : ""}
                                                        </p>
                                                        <span className="hidden sm:inline text-muted-foreground/30">•</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            <span className="font-medium text-foreground/70">Fin:</span> {formatDate(exam.EndTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center sm:justify-end w-full sm:w-auto gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/exams/${exam.ExamID}`)}
                                                    className="w-full sm:w-auto border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all duration-200 group/btn"
                                                >
                                                    Ver detalles
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover/btn:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
    </div>
    );
};

export default DashboardStudent;