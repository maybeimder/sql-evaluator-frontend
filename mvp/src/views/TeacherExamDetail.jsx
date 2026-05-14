import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, ArrowLeft, Search, UserPlus, FileText, Activity, GraduationCap, Clock, ChevronRight, UserX, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const TeacherExamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [exam, setExam] = useState(null);       // info del examen
    const [students, setStudents] = useState([]); // estudiantes asignados al examen

    const [searchTerm, setSearchTerm] = useState("");
    const [showAssignPanel, setShowAssignPanel] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState("");

    // Lista de estudiantes disponibles para asignar (desde /users/roles/3)
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentsError, setStudentsError] = useState("");

    useEffect(() => {
        const fetchExamInfo = async () => {
            if (!accessToken || !id) return;

            setLoading(true);
            setErrorMsg("");

            try {
                const res = await fetch(`${API_URL}/exams/id/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: "include",
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                        data.message || "Error al cargar la información del examen"
                    );
                }

                const data = await res.json();
                setExam(data.exam);
                setStudents(data.exam.Students || []);
            } catch (err) {
                console.error("[TeacherExamDetail] error:", err);
                setErrorMsg(err.message || "Error inesperado");
            } finally {
                setLoading(false);
            }
        };

        fetchExamInfo();
    }, [accessToken, id]);

    const fetchAvailableStudents = async () => {
        if (availableStudents.length > 0 || loadingStudents) return;
        if (!accessToken) return;

        try {
            setLoadingStudents(true);
            setStudentsError("");

            const res = await fetch(`${API_URL}/users/roles/3`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    data.message || "Error al cargar la lista de estudiantes"
                );
            }

            const data = await res.json();
            const rawUsers = data.users || [];

            const normalized = rawUsers.map((u) => ({
                id: u.UserID || u.id,
                name: u.FullName || u.name,
                email: u.Email || u.email,
            }));

            setAvailableStudents(normalized);
        } catch (err) {
            console.error("[TeacherExamDetail] error fetch students:", err);
            setStudentsError(err.message || "Error al cargar estudiantes");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleToggleAssignPanel = () => {
        const next = !showAssignPanel;
        setShowAssignPanel(next);
        if (next) {
            fetchAvailableStudents();
        }
    };

    const availableToAssign = availableStudents.filter(
        (s) =>
            !students.some(
                (as) => (as.StudentID || as.id) === s.id
            )
    );

    const handleAssignStudent = async () => {
        if (!selectedStudentId) return;

        if (!accessToken) {
            alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
            navigate("/login");
            return;
        }

        const student = availableStudents.find(
            (s) => String(s.id) === String(selectedStudentId)
        );
        if (!student) return;

        const examID = exam?.ExamID || id;

        try {
            const assignmentRes = await fetch(`${API_URL}/assignments`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    ExamID: examID,
                    StudentID: student.id,
                }),
            });

            if (!assignmentRes.ok) {
                const errData = await assignmentRes.json().catch(() => ({}));
                throw new Error(
                    errData.message || "Error al asignar el estudiante al examen"
                );
            }

            setStudents((prev) => [
                ...prev,
                {
                    StudentID: student.id,
                    FullName: student.name,
                    Email: student.email,
                    status: "Pendiente",
                    score: null,
                },
            ]);

            setSelectedStudentId("");
            setShowAssignPanel(false);
        } catch (err) {
            console.error("[TeacherExamDetail] error assigning student:", err);
            alert(err.message || "Error al asignar el estudiante");
        }
    };

    const getStatusBadgeClasses = (status) => {
        if (status === "Completado") return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
        if (status === "Pendiente") return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
        if (status === "En progreso") return { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" };
        return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
    };

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading && !exam) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-muted-foreground tracking-wide">
                        Sincronizando información del examen...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-5 bg-card/30 p-10 rounded-3xl border border-white/5 backdrop-blur-md shadow-xl"
                >
                    <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-destructive/20">
                        <FileText className="h-10 w-10 text-destructive" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-foreground">Examen no encontrado</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            {errorMsg || "No pudimos localizar la información para este examen. Es posible que haya sido eliminado."}
                        </p>
                    </div>
                    <Button onClick={() => navigate("/dashboard/teacher")} className="gap-2 px-8">
                        <ArrowLeft className="h-4 w-4" /> Volver al panel
                    </Button>
                </motion.div>
            </div>
        );
    }

    const assignedCount = exam.AssignedCount ?? students.length;
    const answeredCount = exam.AnsweredCount ?? 0;
    const avgScore = exam.AvgScore ?? null;

    const now = new Date();
    let examStatus = "Activo";
    if (exam?.EndTime) {
        const end = new Date(exam.EndTime);
        if (end.getTime() < now.getTime()) {
            examStatus = "Cerrado";
        }
    }

    const filteredStudents = students.filter((s) => {
        const name = s.FullName || s.name || "";
        const email = s.Email || s.email || "";
        return `${name} ${email}`.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">QueryLogic</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/teacher")}
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all duration-200 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Volver al Panel</span>
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-8 py-8 max-w-6xl">
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

                    {/* Tarjeta Superior: Info del Examen */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 shadow-xl shadow-black/10 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 relative z-10 border-b border-white/5">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{exam.Title}</CardTitle>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${examStatus === "Activo" ? "bg-success/10 text-success border-success/20" : "bg-muted/20 text-muted-foreground border-muted/30"}`}>
                                            {examStatus === "Activo" && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>}
                                            {examStatus}
                                        </div>
                                    </div>
                                    <CardDescription className="text-sm text-muted-foreground/80 max-w-2xl leading-relaxed">
                                        {exam.Description || "Sin descripción proporcionada para esta evaluación."}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/exam/edit/${exam.ExamID || id}`)}
                                        className="gap-2 border-white/10 hover:bg-white/5 hover:border-white/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Editar Examen
                                    </Button>
                                    <Button
                                        onClick={handleToggleAssignPanel}
                                        className="gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Asignar Estudiantes
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 relative z-10 bg-black/20">
                                <div className="bg-background/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-colors hover:bg-background/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Participación</p>
                                    </div>
                                    <p className="text-2xl font-black text-foreground">
                                        {answeredCount} <span className="text-muted-foreground/50 text-lg font-bold">/ {assignedCount}</span>
                                    </p>
                                </div>
                                <div className="bg-background/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-colors hover:bg-background/60 relative overflow-hidden group">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,theme(colors.success.DEFAULT)_0%,transparent_100%)]"></div>
                                    <div className="flex items-center gap-2 mb-1 relative z-10">
                                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Promedio</p>
                                    </div>
                                    <p className="text-2xl font-black text-success relative z-10">
                                        {avgScore !== null && avgScore !== undefined ? `${avgScore}%` : "—"}
                                    </p>
                                </div>
                                <div className="bg-background/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-colors hover:bg-background/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Duración</p>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">
                                        {exam.StartTime && exam.EndTime
                                            ? `${Math.round((new Date(exam.EndTime) - new Date(exam.StartTime)) / 60000)} min`
                                            : "Sin límite"}
                                    </p>
                                </div>
                                <div className="bg-background/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center transition-colors hover:bg-background/60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Base de Datos</p>
                                    </div>
                                    <p className="text-sm font-bold text-foreground truncate" title={exam.DatabaseID || "Ninguna"}>
                                        {exam.DatabaseID || "Libre"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Panel de Asignación (Desplegable) */}
                    <AnimatePresence>
                        {showAssignPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-primary/5 border border-primary/20 shadow-lg shadow-primary/5">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <UserPlus className="h-4 w-4 text-primary" />
                                            Asignar nuevo estudiante
                                        </CardTitle>
                                        <CardDescription>
                                            Selecciona un estudiante matriculado para otorgarle acceso a esta evaluación.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                        <div className="flex-1 relative">
                                            <select
                                                className="w-full px-4 h-11 border border-white/10 rounded-xl bg-black/40 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer transition-all"
                                                value={selectedStudentId}
                                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                                disabled={loadingStudents || availableStudents.length === 0}
                                            >
                                                <option value="" disabled className="bg-background">
                                                    {loadingStudents ? "Cargando lista de estudiantes..." : "Despliega para seleccionar..."}
                                                </option>
                                                {availableToAssign.map((student) => (
                                                    <option key={student.id} value={student.id} className="bg-background py-2">
                                                        {student.name} ({student.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleAssignStudent}
                                            disabled={!selectedStudentId || loadingStudents}
                                            className="h-11 px-8 font-bold"
                                        >
                                            Confirmar Asignación
                                        </Button>
                                    </CardContent>

                                    {(studentsError || (!loadingStudents && availableStudents.length === 0)) && (
                                        <div className="px-6 pb-6">
                                            <div className="bg-background/50 border border-white/5 rounded-lg p-3 flex items-center gap-2">
                                                <UserX className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">
                                                    {studentsError || "No hay estudiantes nuevos disponibles para asignar."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tabla de Estudiantes */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 shadow-xl shadow-black/10 overflow-hidden">
                            <CardHeader className="bg-black/20 border-b border-white/5 py-5 px-6 sm:px-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg">Registro de Evaluaciones</CardTitle>
                                        <CardDescription className="mt-1">
                                            Seguimiento individual de los {students.length} estudiantes asignados.
                                        </CardDescription>
                                    </div>
                                    <div className="relative w-full sm:w-72 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Buscar estudiante..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-10 bg-black/40 border-white/10 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl shadow-inner"
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {filteredStudents.length === 0 ? (
                                    <div className="px-6 py-16 text-center bg-background/20">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-base font-semibold text-foreground mb-1">Ningún estudiante encontrado</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {searchTerm ? "Intenta con otro nombre o correo." : "No hay estudiantes asignados aún."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table className="min-w-[800px]">
                                            <TableHeader className="bg-black/10 hover:bg-black/10 border-b border-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest h-auto">Estudiante</TableHead>
                                                    <TableHead className="py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest h-auto">Estado</TableHead>
                                                    <TableHead className="py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest h-auto text-center">Calificación</TableHead>
                                                    <TableHead className="px-8 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest h-auto">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStudents.map((student, idx) => {
                                                    const name = student.FullName || student.name;
                                                    const email = student.Email || student.email;
                                                    const status = student.status || (student.score != null ? "Completado" : "Pendiente");
                                                    const score = student.score;
                                                    const statusStyle = getStatusBadgeClasses(status);
                                                    const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
                                                    const isCompleted = status === "Completado";

                                                    return (
                                                        <TableRow
                                                            key={student.StudentID || student.id}
                                                            className={`group hover:bg-white/5 border-white/5 transition-colors ${isCompleted ? 'cursor-pointer' : ''}`}
                                                            onClick={() => {
                                                                if (isCompleted) {
                                                                    navigate(`/teacher/exams/${exam.ExamID || id}/students/${student.StudentID || student.id}`);
                                                                }
                                                            }}
                                                        >
                                                            <TableCell className="px-8 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                                                        {initials}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{name}</p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="py-5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="relative flex h-2 w-2">
                                                                        {status === "En progreso" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                                                                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: statusStyle.color }}></span>
                                                                    </span>
                                                                    <span
                                                                        className="text-xs font-bold tracking-wide border px-2.5 py-1 rounded-md"
                                                                        style={{ color: statusStyle.color, backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}
                                                                    >
                                                                        {status.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="py-5 text-center">
                                                                {isCompleted && typeof score === "number" ? (
                                                                    <span className={`text-sm font-black px-3 py-1 rounded-md border inline-block ${score >= 90 ? "text-success bg-success/10 border-success/20" : score >= 70 ? "text-primary bg-primary/10 border-primary/20" : "text-destructive bg-destructive/10 border-destructive/20"}`}>
                                                                        {score}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm font-semibold text-muted-foreground/50">—</span>
                                                                )}
                                                            </TableCell>

                                                            <TableCell className="px-8 py-5 text-right">
                                                                {isCompleted ? (
                                                                    <div className="flex justify-end">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 gap-1.5 text-xs font-semibold text-primary border-primary/20 bg-transparent hover:bg-primary/10 hover:border-primary/30 transition-all group-hover:translate-x-0 sm:group-hover:-translate-x-1"
                                                                        >
                                                                            <span>Ver Detalles</span>
                                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                                                                        En espera de respuesta
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default TeacherExamDetail;
