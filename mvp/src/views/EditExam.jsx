import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Database, Plus, Trash2, Save, X, Clock, FileText, Settings, LayoutList, GripVertical, ArrowLeft } from "lucide-react";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const parseISOToForm = (isoString) => {
    if (!isoString) return { date: "", time: "" };
    const d = new Date(isoString);
    const date = d.toISOString().split("T")[0];
    const time = d.toTimeString().slice(0, 5);
    return { date, time };
};

const EditExam = () => {
    const { id } = useParams();
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    const [examType, setExamType] = useState("sql");
    const handleExamTypeChange = (type) => {
        setExamType(type);
        if (type === "pseudocode") setDatabaseID("");
    };
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [questionErrors, setQuestionErrors] = useState({});
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [examTitle, setExamTitle] = useState("");
    const [examDescription, setExamDescription] = useState("");
    const [deadlineDate, setDeadlineDate] = useState("");
    const [deadlineTime, setDeadlineTime] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("60");
    const [databaseID, setDatabaseID] = useState("");
    const [allowsRejoin, setAllowsRejoin] = useState(false);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchExam = async () => {
            if (!accessToken || !id) return;
            try {
                setLoading(true);
                const [examRes, questionsRes] = await Promise.all([
                    fetch(`${API_URL}/exams/id/${id}`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        credentials: "include",
                    }),
                    fetch(`${API_URL}/exams/id/${id}/questions`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        credentials: "include",
                    }),
                ]);

                if (!examRes.ok) throw new Error("No se pudo cargar el examen");
                const examData = await examRes.json();
                const exam = examData.exam;

                const now = new Date();
                if (exam.StartTime && exam.EndTime) {
                    const start = new Date(exam.StartTime);
                    const end = new Date(exam.EndTime);
                    if (now >= start && now < end) {
                        setIsLocked(true);
                        setLoading(false);
                        return;
                    }
                }

                setExamTitle(exam.Title || "");
                setExamDescription(exam.Description || "");
                if (exam.EndTime && exam.StartTime) {
                    const diffMs = new Date(exam.EndTime) - new Date(exam.StartTime);
                    setDurationMinutes(String(Math.round(diffMs / 60000)));
                } else {
                    setDurationMinutes("60");
                }
                setDatabaseID(exam.DatabaseID || "");
                setAllowsRejoin(exam.AllowsRejoin || false);
                setExamType(exam.Type || "sql");

                const { date, time } = parseISOToForm(exam.StartTime);
                setDeadlineDate(date);
                setDeadlineTime(time);

                if (questionsRes.ok) {
                    const questionsData = await questionsRes.json();
                    const loadedQuestions = questionsData.ok && questionsData.questions?.length > 0
                        ? questionsData.questions.map((q, i) => ({
                            id: q.QuestionID || Date.now() + i,
                            title: q.QuestionTitle || "",
                            description: q.QuestionText || "",
                            solutionExample: q.SolutionExample || "",
                            expectedOutput: q.ExpectedOutput ?? "",
                            points: q.Value || 10,
                        }))
                        : [{ id: Date.now(), title: "", description: "", solutionExample: "", expectedOutput: "", points: 10 }];
                    setQuestions(loadedQuestions);
                } else {
                    setQuestions([{ id: Date.now(), title: "", description: "", solutionExample: "", expectedOutput: "", points: 10 }]);
                }
            } catch (err) {
                setErrorMsg(err.message || "Error al cargar el examen");
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [accessToken, id]);

    const buildStartTimeISO = () => {
        if (!deadlineDate || !deadlineTime) return null;
        return new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            id: Date.now(),
            title: "", description: "",
            solutionExample: "", expectedOutput: "", points: 10, type: "sql",
        }]);
    };

    const removeQuestion = (qid) => {
        setQuestions(prev => prev.filter(q => q.id !== qid));
    };

    const updateQuestionField = (qid, field, value) => {
        setQuestions(prev => prev.map(q =>
            q.id === qid ? { ...q, [field]: field === "points" ? Number(value) || 0 : value } : q
        ));
    };

    const handleSave = async () => {
        setErrorMsg("");

        const fErrors = {};
        if (!examTitle.trim()) fErrors.examTitle = "El título es obligatorio";
        if (!deadlineDate) fErrors.deadlineDate = "Requerida";
        if (!deadlineTime) fErrors.deadlineTime = "Requerida";
        if (!durationMinutes || Number(durationMinutes) <= 0) fErrors.durationMinutes = "Debe ser mayor a 0";

        const qErrors = {};
        questions.forEach((q) => {
            const e = {};
            if (!q.title.trim()) e.title = "Obligatorio";
            if (!q.description.trim()) e.description = "Obligatorio";
            if (!q.solutionExample.trim()) e.solutionExample = "Obligatorio";
            if (q.expectedOutput === "" || q.expectedOutput === null || q.expectedOutput === undefined) e.expectedOutput = "Obligatorio";
            if (!q.points || q.points <= 0) e.points = "Debe ser > 0";
            if (Object.keys(e).length > 0) qErrors[q.id] = e;
        });

        if (Object.keys(fErrors).length > 0 || Object.keys(qErrors).length > 0) {
            setFieldErrors(fErrors);
            setQuestionErrors(qErrors);
            setErrorMsg("Revisá los campos marcados en rojo antes de guardar.");
            return;
        }
        setFieldErrors({});
        setQuestionErrors({});

        const payload = {
            Title: examTitle,
            Description: examDescription || null,
            StartTime: buildStartTimeISO(),
            Duration: Number(durationMinutes),
            DatabaseID: databaseID || null,
            AllowsRejoin: allowsRejoin,
            Type: examType.toUpperCase(),
            questions: questions.map(q => ({
                QuestionTitle: q.title,
                QuestionText: q.description,
                ExpectedOutput: q.expectedOutput !== "" && q.expectedOutput !== null && q.expectedOutput !== undefined ? Number(q.expectedOutput) : null,
                SolutionExample: q.solutionExample,
                Value: q.points || 0,
            })),
        };

        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/exams/id/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Error al actualizar el examen (${res.status})`);
            navigate(`/teacher/exams/${id}`);
        } catch (err) {
            setErrorMsg(err.message || "Error inesperado al guardar");
        } finally {
            setSaving(false);
        }
    };

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-muted-foreground animate-pulse">Cargando examen...</p>
                </div>
            </div>
        );
    }

    if (isLocked) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-5 max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Examen en curso</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            No puedes editar este examen mientras está siendo rendido por los estudiantes. Espera a que finalice para hacer cambios.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2 border-white/10 hover:bg-white/5"
                        onClick={() => navigate(`/teacher/exams/${id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al examen
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-background pb-16">

            {/* Navbar */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-sm">
                <div className="container mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">QueryLogic</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/teacher/exams/${id}`)}
                            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 hidden sm:flex"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                            className="gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-8 py-10">
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-8">
                    <motion.p variants={itemVariants} className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Editar Examen SQL</motion.p>
                    <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Modificar Evaluación</motion.h1>
                    <motion.p variants={itemVariants} className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                        Actualiza el título, preguntas, tiempo y configuración del examen.
                    </motion.p>
                </motion.div>

                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                            <X className="h-4 w-4 text-destructive" />
                        </div>
                        <p className="text-sm font-medium text-destructive">{errorMsg}</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">

                    {/* Columna izquierda */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

                        {/* Configuración General */}
                        <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-foreground">Configuración General</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">Metadatos y restricciones de tiempo</p>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Título del Examen</Label>
                                    <Input
                                        placeholder="ej: SQL Básico — Consultas SELECT y WHERE"
                                        value={examTitle}
                                        onChange={e => { setExamTitle(e.target.value); setFieldErrors(f => ({ ...f, examTitle: undefined })); }}
                                        className={`h-11 bg-black/20 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl ${fieldErrors.examTitle ? "border-destructive/70" : "border-white/10 focus-visible:border-primary/50"}`}
                                    />
                                    {fieldErrors.examTitle && <p className="text-xs text-destructive ml-1">{fieldErrors.examTitle}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Descripción / Instrucciones</Label>
                                    <Textarea
                                        placeholder="Provee una breve descripción o instrucciones iniciales..."
                                        rows={3}
                                        value={examDescription}
                                        onChange={e => setExamDescription(e.target.value)}
                                        className="resize-none bg-black/20 border-white/10 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl p-3"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 bg-black/10 p-4 sm:p-5 rounded-2xl border border-white/5">
                                    {[
                                        { label: "Fecha de inicio", id: "date", type: "date", value: deadlineDate, setter: setDeadlineDate, errorKey: "deadlineDate" },
                                        { label: "Hora de inicio", id: "time", type: "time", value: deadlineTime, setter: setDeadlineTime, errorKey: "deadlineTime" },
                                        { label: "Duración (min)", id: "dur", type: "number", min: "1", value: durationMinutes, setter: setDurationMinutes, errorKey: "durationMinutes", transform: v => String(Math.max(1, Number(v) || 1)) },
                                    ].map(field => (
                                        <div key={field.id} className="space-y-2">
                                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{field.label}</Label>
                                            <Input
                                                type={field.type}
                                                min={field.min}
                                                value={field.value}
                                                onChange={e => { const val = field.transform ? field.transform(e.target.value) : e.target.value; field.setter(val); setFieldErrors(f => ({ ...f, [field.errorKey]: undefined })); }}
                                                className={`h-10 bg-black/20 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg text-sm ${fieldErrors[field.errorKey] ? "border-destructive/70" : "border-white/10 focus-visible:border-primary/50"}`}
                                            />
                                            {fieldErrors[field.errorKey] && <p className="text-xs text-destructive ml-1">{fieldErrors[field.errorKey]}</p>}
                                        </div>
                                    ))}
                                </div>

                                {/* Aviso fecha en el pasado */}
                                {deadlineDate && deadlineTime && new Date(`${deadlineDate}T${deadlineTime}:00`) < new Date() && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/20">
                                        <Clock className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                                        <p className="text-xs font-medium text-warning">La fecha y hora de inicio ya pasaron. Los estudiantes no podrán acceder al examen.</p>
                                    </div>
                                )}

                                {/* Tipo de examen */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Tipo de Ejercicio</Label>
                                    <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-xl border border-white/5 w-fit">
                                        {[
                                            { value: "sql", label: "SQL" },
                                            { value: "pseudocode", label: "Pseudocódigo" },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleExamTypeChange(opt.value)}
                                                className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200"
                                                style={examType === opt.value
                                                    ? { background: "rgba(99,102,241,0.2)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.4)" }
                                                    : { background: "transparent", color: "#7c7fa8", border: "1px solid transparent" }
                                                }
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2 pl-2">
                                    <div className="relative flex items-center">
                                        <input
                                            id="allowsRejoin"
                                            type="checkbox"
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-black/20 transition-all checked:border-primary checked:bg-primary hover:border-primary/50"
                                            checked={allowsRejoin}
                                            onChange={e => setAllowsRejoin(e.target.checked)}
                                        />
                                        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                        </span>
                                    </div>
                                    <Label htmlFor="allowsRejoin" className="text-sm font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                                        Permitir a los estudiantes reingresar al examen tras salir
                                    </Label>
                                </div>
                            </div>
                        </motion.div>

                        {/* Sección Preguntas */}
                        <motion.div variants={itemVariants} className="flex items-center justify-between pt-4 pb-2 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <LayoutList className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-lg font-bold text-foreground">Banco de Preguntas</h2>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {questions.length} {questions.length === 1 ? "Pregunta" : "Preguntas"}
                            </span>
                        </motion.div>

                        {/* Lista de Preguntas */}
                        <div className="space-y-6">
                            <AnimatePresence>
                                {questions.map((question, index) => (
                                    <motion.div
                                        key={question.id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, overflow: "hidden" }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 relative group hover:border-white/10 transition-colors"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/50 to-primary/10 rounded-l-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:bg-white/5 rounded-md transition-colors">
                                                    <GripVertical className="h-4 w-4" />
                                                </div>
                                                <span className="text-base font-bold text-foreground">
                                                    Pregunta <span className="text-primary">#{index + 1}</span>
                                                </span>
                                            </div>
                                            {questions.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setConfirmDeleteId(question.id)}
                                                    className="h-8 px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group/btn"
                                                >
                                                    <Trash2 className="h-4 w-4 sm:mr-1.5 group-hover/btn:scale-110 transition-transform" />
                                                    <span className="hidden sm:inline text-xs">Eliminar</span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-5 ml-2 sm:ml-6">
                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Título de la pregunta</Label>
                                                    <Input
                                                        placeholder="ej: Filtro de clientes por país activo"
                                                        value={question.title}
                                                        onChange={e => { updateQuestionField(question.id, "title", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], title: undefined } })); }}
                                                        className={`h-10 bg-black/20 focus-visible:border-primary/50 transition-all rounded-lg ${questionErrors[question.id]?.title ? "border-destructive/70" : "border-white/10"}`}
                                                    />
                                                    {questionErrors[question.id]?.title && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].title}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[11px] font-bold text-primary/80 uppercase tracking-widest ml-1">Valor (Pts)</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={question.points}
                                                        onChange={e => { updateQuestionField(question.id, "points", Math.max(1, Number(e.target.value) || 1)); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], points: undefined } })); }}
                                                        className={`h-10 bg-primary/5 text-primary font-bold text-center focus-visible:border-primary/50 transition-all rounded-lg ${questionErrors[question.id]?.points ? "border-destructive/70" : "border-primary/20"}`}
                                                    />
                                                    {questionErrors[question.id]?.points && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].points}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Enunciado / Contexto</Label>
                                                <Textarea
                                                    placeholder="Describe la tarea lógica o la consulta que debe resolverse..."
                                                    rows={2}
                                                    value={question.description}
                                                    onChange={e => { updateQuestionField(question.id, "description", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], description: undefined } })); }}
                                                    className={`resize-none bg-black/20 focus-visible:border-primary/50 transition-all rounded-lg p-3 ${questionErrors[question.id]?.description ? "border-destructive/70" : "border-white/10"}`}
                                                />
                                                {questionErrors[question.id]?.description && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].description}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                                                <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex gap-1.5 mr-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                                        </div>
                                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{examType === "sql" ? "Solución Esperada (SQL)" : "Solución Esperada (Pseudocódigo)"}</Label>
                                                    </div>
                                                    <Textarea
                                                        placeholder={examType === "sql" ? "SELECT * FROM tabla WHERE condicion = 1;" : "INICIO\n  SI condicion ENTONCES\n    RETORNAR valor\n  FIN SI\nFIN"}
                                                        rows={4}
                                                        value={question.solutionExample}
                                                        onChange={e => { updateQuestionField(question.id, "solutionExample", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], solutionExample: undefined } })); }}
                                                        className="resize-none bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                                                        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', color: "#a78bfa", lineHeight: "1.6" }}
                                                    />
                                                    {questionErrors[question.id]?.solutionExample && <p className="text-xs text-destructive">{questionErrors[question.id].solutionExample}</p>}
                                                </div>

                                                <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Filas Esperadas</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="ej: 8"
                                                        value={question.expectedOutput}
                                                        onChange={e => { updateQuestionField(question.id, "expectedOutput", e.target.value === "" ? "" : Number(e.target.value)); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], expectedOutput: undefined } })); }}
                                                        className={`h-10 bg-black/20 focus-visible:border-primary/50 transition-all rounded-lg text-center font-bold text-emerald-400 ${questionErrors[question.id]?.expectedOutput ? "border-destructive/70" : "border-white/10"}`}
                                                    />
                                                    {questionErrors[question.id]?.expectedOutput && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].expectedOutput}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <motion.div layout>
                                <button
                                    onClick={addQuestion}
                                    className="w-full mt-4 flex items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-300 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                                        <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="font-semibold tracking-wide">Añadir nueva pregunta al examen</span>
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Columna derecha (Sidebar) */}
                    <motion.div variants={itemVariants} className="space-y-6 xl:sticky xl:top-24 xl:self-start">

                        {/* Panel de Resumen */}
                        <div className="bg-card/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-foreground block">Resumen del Examen</span>
                                    <span className="text-xs text-muted-foreground">Vista en tiempo real</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Total Preguntas", value: questions.length, highlight: false },
                                    { label: "Puntaje Máximo", value: `${totalPoints} pts`, highlight: true },
                                    { label: "Tiempo Límite", value: durationMinutes ? `${durationMinutes} m` : "—", highlight: false },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-black/20 p-3.5 rounded-xl border border-white/5">
                                        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                                        <span className={`text-sm font-black ${item.highlight ? "text-primary" : "text-foreground"}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full mt-6 gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 h-11 text-sm font-bold tracking-wide"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "Procesando..." : "Guardar Cambios"}
                            </Button>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>

        {/* Modal confirmar eliminar pregunta */}
        <AnimatePresence>
            {confirmDeleteId !== null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={() => setConfirmDeleteId(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 16 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-card border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full"
                    >
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <h3 className="text-base font-bold text-foreground text-center mb-1">¿Eliminar pregunta?</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
                                onClick={() => { removeQuestion(confirmDeleteId); setConfirmDeleteId(null); }}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};

export default EditExam;
