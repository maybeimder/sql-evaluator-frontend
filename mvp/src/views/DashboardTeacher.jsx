import { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Eye, FileText, Users, Plus, Clock, ChevronRight, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import DashboardLayout from "../Components/DashboardLayout";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const getExamStatus = (exam) => {
    const now = new Date();
    const start = exam.StartTime ? new Date(exam.StartTime) : null;
    const end = exam.EndTime ? new Date(exam.EndTime) : null;
    if (!start || !end) return { label: "Sin fecha", color: "#7c7fa8", bg: "rgba(124,127,168,0.1)" };
    if (now < start) return { label: "Próximo", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" };
    if (now > end) return { label: "Cerrado", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" };
    return { label: "Abierto", color: "#34d399", bg: "rgba(52,211,153,0.1)" };
};

const DashboardTeacher = () => {
    const navigate = useNavigate();
    const { user, accessToken } = useAuth();
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [errorExams, setErrorExams] = useState("");

    useEffect(() => {
        const fetchExams = async () => {
            if (!accessToken) return;
            setLoadingExams(true);
            setErrorExams("");
            try {
                const res = await fetch(`${API_URL}/exams`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${accessToken}` },
                    credentials: "include",
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Error al cargar los exámenes");
                }
                const data = await res.json();
                setExams(Array.isArray(data) ? data : []);
            } catch (err) {
                setErrorExams(err.message || "Error inesperado");
            } finally {
                setLoadingExams(false);
            }
        };
        fetchExams();
    }, [accessToken]);

    // Variantes de Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <DashboardLayout label="Prof.">
            <div className="container mx-auto px-4 sm:px-8 py-8">

                {/* Título */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Panel del Docente</p>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight">
                                {user?.FullName ? `Hola, ${user.FullName.split(' ')[0]}` : 'Panel del Profesor'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">Gestiona tus exámenes, estudiantes y bases de datos</p>
                        </div>
                        <Button
                            onClick={() => navigate("/exam/create")}
                            size="sm"
                            className="gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Examen
                        </Button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                >
                    {[
                        { label: "Exámenes creados", value: exams.length, sub: "Total", color: "text-primary", shadow: "shadow-primary/10", borderHover: "hover:border-primary/30" },
                        { label: "Estudiantes activos", value: "—", sub: "Ver en estudiantes", color: "text-success", shadow: "shadow-success/10", borderHover: "hover:border-success/30" },
                        { label: "Exámenes abiertos", value: exams.filter(e => getExamStatus(e).label === "Abierto").length, sub: "En curso", color: "text-warning", shadow: "shadow-warning/10", borderHover: "hover:border-warning/30" },
                    ].map((stat, i) => (
                        <motion.div variants={itemVariants} key={i} className="h-full">
                            <div className={`h-full bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg ${stat.shadow} ${stat.borderHover} transition-all duration-300 ease-out group relative overflow-hidden`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-xl transition-colors duration-500 opacity-0 group-hover:opacity-10 bg-current ${stat.color}`}></div>
                                <p className="text-xs font-medium text-muted-foreground mb-1 group-hover:text-foreground/80 transition-colors">{stat.label}</p>
                                <p className={`text-4xl font-bold ${stat.color} tracking-tight group-hover:scale-105 origin-left transition-transform duration-300`}>{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-2 opacity-80">{stat.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Acciones rápidas */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                >
                    {[
                        {
                            icon: Plus, label: "Crear examen", sub: "Nuevo examen SQL",
                            color: "text-primary", bg: "bg-primary/10",
                            border: "hover:border-primary/50", hoverShadow: "hover:shadow-primary/20", action: () => navigate("/exam/create")
                        },
                        {
                            icon: Users, label: "Ver estudiantes", sub: "Gestionar lista",
                            color: "text-success", bg: "bg-success/10",
                            border: "hover:border-success/50", hoverShadow: "hover:shadow-success/20", action: () => navigate("/students")
                        },
                        {
                            icon: Database, label: "Bases de datos", sub: "Administrar BD",
                            color: "text-accent", bg: "bg-accent/10",
                            border: "hover:border-accent/50", hoverShadow: "hover:shadow-accent/20", action: () => navigate("/databases")
                        },
                    ].map((item, i) => (
                        <motion.div variants={itemVariants} key={i}>
                            <div
                                onClick={item.action}
                                className={`h-full bg-card/40 backdrop-blur-md border border-white/5 ${item.border} rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg ${item.hoverShadow} transition-all duration-300 ease-out group`}
                            >
                                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-inner transition-all duration-300`}>
                                    <item.icon className={`h-6 w-6 ${item.color} group-hover:animate-pulse`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Lista de exámenes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-bold text-foreground">Exámenes creados</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50">
                                {exams.length} {exams.length !== 1 ? "exámenes" : "examen"}
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate("/exam/create")}
                                className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1"
                            >
                                <Plus className="h-3 w-3" />
                                Crear
                            </Button>
                        </div>
                    </div>

                    {errorExams && (
                        <div className="px-6 py-4">
                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{errorExams}</p>
                        </div>
                    )}

                    {loadingExams ? (
                        <div className="px-6 py-12 text-center flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-sm text-muted-foreground animate-pulse">Cargando exámenes...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-6 py-16 text-center flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground/50 animate-bounce" style={{ animationDuration: '3s' }} />
                            </div>
                            <p className="text-base font-medium text-foreground mb-1">Aún no has creado exámenes</p>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm">Comienza creando tu primer examen SQL para evaluar a tus estudiantes.</p>

                            <Button
                                onClick={() => navigate("/exam/create")}
                                className="group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                    Crear primer examen
                                </span>
                            </Button>

                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-white/5"
                        >
                            {exams.map((exam, i) => {
                                const status = getExamStatus(exam);
                                return (
                                    <motion.div
                                        variants={itemVariants}
                                        key={exam.ExamID}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-all duration-300 group cursor-pointer"
                                        onClick={() => navigate(`/teacher/exams/${exam.ExamID}`, {
                                            state: { examID: exam.ExamID }
                                        })}
                                    >
                                        <div className="flex items-center flex-1 gap-4 min-w-0">
                                            {/* Dot de estado */}
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm group-hover:scale-150 group-hover:shadow-md transition-all duration-300"
                                                style={{ background: status.color, boxShadow: `0 0 8px ${status.color}80` }} />

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                                                    {exam.Title}
                                                </p>
                                                {exam.GroupName && (
                                                    <span
                                                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                                                        style={{
                                                            background: 'rgba(99,102,241,0.1)',
                                                            color: '#6366f1',
                                                            border: '1px solid rgba(99,102,241,0.2)'
                                                        }}
                                                    >
                                                        ⊞ {exam.GroupName}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary/70 transition-colors" />
                                                    <p className="text-xs text-muted-foreground">
                                                        {exam.StartTime
                                                            ? new Date(exam.StartTime).toLocaleString("es-CO", {
                                                                day: "2-digit", month: "short",
                                                                hour: "2-digit", minute: "2-digit"
                                                            })
                                                            : "Sin fecha"}
                                                        <span className="mx-1.5 opacity-50 hidden sm:inline">•</span>
                                                        <span className="block sm:inline mt-1 sm:mt-0">{exam.students ?? 0} estudiantes</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 w-full sm:w-auto pl-6 sm:pl-0">
                                            {/* Badge estado */}
                                            <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 border border-white/5 group-hover:border-white/20 transition-colors uppercase tracking-wider"
                                                style={{ color: status.color, background: status.bg }}>
                                                {status.label}
                                            </span>

                                            {/* Botón */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="flex-shrink-0 h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-200 active:scale-95"
                                            >
                                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardTeacher;
