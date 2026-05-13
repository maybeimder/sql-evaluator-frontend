import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Database, Plus, Trash2, Save, X, Clock, FileText, Settings, LayoutList, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const CreateExam = () => {
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    const [examTitle, setExamTitle] = useState("");
    const [examDescription, setExamDescription] = useState("");
    const [deadlineDate, setDeadlineDate] = useState("");
    const [deadlineTime, setDeadlineTime] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("60");
    const [databaseID, setDatabaseID] = useState("");
    const [allowsRejoin, setAllowsRejoin] = useState(false);
    const [questions, setQuestions] = useState([{
        id: 1, title: "", description: "",
        solutionExample: "", expectedOutput: "", points: 10,
    }]);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [questionErrors, setQuestionErrors] = useState({});

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            id: Date.now(), // ID único para AnimatePresence
            title: "", description: "",
            solutionExample: "", expectedOutput: "", points: 10,
        }]);
    };

    const removeQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const updateQuestionField = (id, field, value) => {
        setQuestions(prev => prev.map(q =>
            q.id === id ? { ...q, [field]: field === "points" ? Number(value) || 0 : value } : q
        ));
    };

    const buildStartTimeISO = () => {
        if (!deadlineDate || !deadlineTime) return null;
        return new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
    };

    const validateQuestions = (questions) => {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const idx = i + 1;
            if (!q.title.trim()) return { valid: false, error: `La pregunta ${idx} necesita un título.` };
            if (!q.description.trim()) return { valid: false, error: `La pregunta ${idx} necesita un enunciado.` };
            if (!q.solutionExample.trim()) return { valid: false, error: `La pregunta ${idx} necesita la consulta SQL solución.` };
            if (!q.expectedOutput.trim()) return { valid: false, error: `La pregunta ${idx} necesita la salida esperada.` };
            if (!q.points || q.points <= 0) return { valid: false, error: `La pregunta ${idx} necesita puntos mayores a 0.` };
        }
        return { valid: true, error: null };
    };

    const handleSaveExam = async () => {
        setErrorMsg("");
        if (!accessToken) { setErrorMsg("No hay sesión activa."); navigate("/login"); return; }

        const fErrors = {};
        if (!examTitle.trim()) fErrors.examTitle = "El título es obligatorio";
        if (!deadlineDate) fErrors.deadlineDate = "Requerida";
        if (!deadlineTime) fErrors.deadlineTime = "Requerida";
        if (!durationMinutes || Number(durationMinutes) <= 0) fErrors.durationMinutes = "Debe ser mayor a 0";

        const qErrors = {};
        questions.forEach((q, i) => {
            const e = {};
            if (!q.title.trim()) e.title = "Obligatorio";
            if (!q.description.trim()) e.description = "Obligatorio";
            if (!q.solutionExample.trim()) e.solutionExample = "Obligatorio";
            if (!q.expectedOutput.trim()) e.expectedOutput = "Obligatorio";
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
            StartTime: startTime,
            Duration: Number(durationMinutes),
            DatabaseID: databaseID || null,
            AllowsRejoin: allowsRejoin,
            questions: questions.map(q => ({
                QuestionTitle: q.title,
                QuestionText: q.description,
                ExpectedOutput: q.expectedOutput ? { text: q.expectedOutput } : null,
                SolutionExample: q.solutionExample,
                Value: q.points || 0,
            })),
        };

        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/exams`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || `Error al crear el examen (${res.status})`);
            navigate("/dashboard/teacher");
        } catch (err) {
            setErrorMsg(err.message || "Error inesperado al guardar el examen");
        } finally {
            setSaving(false);
        }
    };

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
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
                            onClick={() => navigate("/dashboard/teacher")}
                            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 hidden sm:flex"
                        >
                            <X className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSaveExam}
                            disabled={saving}
                            className="gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Guardando..." : "Guardar Examen"}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-8 py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="mb-8"
                >
                    <motion.p variants={itemVariants} className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Nuevo Examen SQL</motion.p>
                    <motion.h1 variants={itemVariants} className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Crear Evaluación</motion.h1>
                    <motion.p variants={itemVariants} className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                        Define las preguntas, la configuración de tiempo y la base de datos a usar. Construye tu evaluación de manera secuencial y estructurada.
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

                {/* Layout 2 columnas */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">

                    {/* Columna izquierda (Contenido principal) */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

                        {/* Configuración General */}
                        <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
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
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                        Título del Examen
                                    </Label>
                                    <Input
                                        placeholder="ej: SQL Básico — Consultas SELECT y WHERE"
                                        value={examTitle}
                                        onChange={e => { setExamTitle(e.target.value); setFieldErrors(f => ({ ...f, examTitle: undefined })); }}
                                        className={`h-11 bg-black/20 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl ${fieldErrors.examTitle ? 'border-destructive/70' : 'border-white/10 focus-visible:border-primary/50'}`}
                                    />
                                    {fieldErrors.examTitle && <p className="text-xs text-destructive ml-1">{fieldErrors.examTitle}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                        Descripción / Instrucciones
                                    </Label>
                                    <Textarea
                                        placeholder="Provee una breve descripción o instrucciones iniciales para los estudiantes..."
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
                                        { label: "Duración (min)", id: "dur", type: "number", value: durationMinutes, setter: setDurationMinutes, errorKey: "durationMinutes" },
                                    ].map(field => (
                                        <div key={field.id} className="space-y-2">
                                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                                {field.label}
                                            </Label>
                                            <Input
                                                type={field.type}
                                                value={field.value}
                                                onChange={e => { field.setter(e.target.value); setFieldErrors(f => ({ ...f, [field.errorKey]: undefined })); }}
                                                className={`h-10 bg-black/20 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-lg text-sm ${fieldErrors[field.errorKey] ? 'border-destructive/70' : 'border-white/10 focus-visible:border-primary/50'}`}
                                            />
                                            {fieldErrors[field.errorKey] && <p className="text-xs text-destructive ml-1">{fieldErrors[field.errorKey]}</p>}
                                        </div>
                                    ))}
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

                        {/* Título Sección Preguntas */}
                        <motion.div variants={itemVariants} className="flex items-center justify-between pt-4 pb-2 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <LayoutList className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="text-lg font-bold text-foreground">Banco de Preguntas</h2>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {questions.length} {questions.length === 1 ? 'Pregunta' : 'Preguntas'}
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
                                        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, overflow: 'hidden' }}
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
                                                    onClick={() => removeQuestion(question.id)}
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
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                                        Título de la pregunta
                                                    </Label>
                                                    <Input
                                                        placeholder="ej: Filtro de clientes por país activo"
                                                        value={question.title}
                                                        onChange={e => { updateQuestionField(question.id, "title", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], title: undefined } })); }}
                                                        className={`h-10 bg-black/20 focus-visible:border-primary/50 transition-all rounded-lg ${questionErrors[question.id]?.title ? 'border-destructive/70' : 'border-white/10'}`}
                                                    />
                                                    {questionErrors[question.id]?.title && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].title}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 text-primary/80">
                                                        Valor (Pts)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={question.points}
                                                        onChange={e => { updateQuestionField(question.id, "points", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], points: undefined } })); }}
                                                        className={`h-10 bg-primary/5 text-primary font-bold text-center focus-visible:border-primary/50 transition-all rounded-lg ${questionErrors[question.id]?.points ? 'border-destructive/70' : 'border-primary/20'}`}
                                                    />
                                                    {questionErrors[question.id]?.points && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].points}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                                    Enunciado / Contexto
                                                </Label>
                                                <Textarea
                                                    placeholder="Describe la tarea lógica o la consulta que debe resolverse..."
                                                    rows={2}
                                                    value={question.description}
                                                    onChange={e => { updateQuestionField(question.id, "description", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], description: undefined } })); }}
                                                    className={`resize-none bg-black/20 focus-visible:border-primary/50 transition-all rounded-lg p-3 ${questionErrors[question.id]?.description ? 'border-destructive/70' : 'border-white/10'}`}
                                                />
                                                {questionErrors[question.id]?.description && <p className="text-xs text-destructive ml-1">{questionErrors[question.id].description}</p>}
                                            </div>

                                            {/* Bloques de Código */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                                                <div className={`space-y-2 bg-black/20 p-4 rounded-2xl border relative overflow-hidden ${questionErrors[question.id]?.solutionExample ? 'border-destructive/50' : 'border-white/5'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex gap-1.5 mr-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                                        </div>
                                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            Solución Esperada (SQL/Lógica)
                                                        </Label>
                                                    </div>
                                                    <Textarea
                                                        placeholder="SELECT * FROM tabla WHERE condicion = 1;"
                                                        rows={4}
                                                        value={question.solutionExample}
                                                        onChange={e => { updateQuestionField(question.id, "solutionExample", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], solutionExample: undefined } })); }}
                                                        className="resize-none bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                                                        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', color: '#a78bfa', lineHeight: '1.6' }}
                                                    />
                                                    {questionErrors[question.id]?.solutionExample && <p className="text-xs text-destructive">{questionErrors[question.id].solutionExample}</p>}
                                                </div>

                                                <div className={`space-y-2 bg-black/20 p-4 rounded-2xl border relative overflow-hidden ${questionErrors[question.id]?.expectedOutput ? 'border-destructive/50' : 'border-white/5'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex gap-1.5 mr-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                                        </div>
                                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                            Salida en Pantalla (Tabla)
                                                        </Label>
                                                    </div>
                                                    <Textarea
                                                        placeholder="Columna1 | Columna2&#10;Dato1    | Dato2"
                                                        rows={4}
                                                        value={question.expectedOutput}
                                                        onChange={e => { updateQuestionField(question.id, "expectedOutput", e.target.value); setQuestionErrors(q => ({ ...q, [question.id]: { ...q[question.id], expectedOutput: undefined } })); }}
                                                        className="resize-none bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                                                        style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', color: '#34d399', lineHeight: '1.6' }}
                                                    />
                                                    {questionErrors[question.id]?.expectedOutput && <p className="text-xs text-destructive">{questionErrors[question.id].expectedOutput}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Botón flotante para agregar pregunta */}
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
                    <motion.div variants={itemVariants} className="space-y-6">

                        {/* Panel de Resumen (Sticky) */}
                        <div className="bg-card/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl xl:sticky xl:top-24">
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
                                        <span className={`text-sm font-black ${item.highlight ? 'text-primary' : 'text-foreground'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleSaveExam}
                                disabled={saving}
                                className="w-full mt-6 gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 h-11 text-sm font-bold tracking-wide"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "Procesando..." : "Finalizar y Guardar"}
                            </Button>
                        </div>

                        {/* Selección de Base de Datos */}
                        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <Database className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">Asignar Base de Datos</span>
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    { id: "", label: "Sin base de datos", sub: "Preguntas teóricas / libres" },
                                    { id: "db-usuarios", label: "Usuarios DB", sub: "Esquema importado" },
                                    { id: "db-productos", label: "Productos DB", sub: "Esquema importado" },
                                    { id: "db-biblioteca", label: "Biblioteca DB", sub: "Esquema importado" },
                                ].map(db => (
                                    <button
                                        key={db.id}
                                        onClick={() => setDatabaseID(db.id)}
                                        className="w-full flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200 group"
                                        style={{
                                            background: databaseID === db.id ? 'rgba(99,102,241,0.1)' : 'rgba(0,0,0,0.2)',
                                            border: databaseID === db.id
                                                ? '1px solid rgba(99,102,241,0.5)'
                                                : '1px solid rgba(255,255,255,0.05)',
                                        }}
                                    >
                                        <div className="relative w-4 h-4 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
                                            style={{ borderColor: databaseID === db.id ? '#6366f1' : '' }}>
                                            {databaseID === db.id && (
                                                <motion.div layoutId="dbIndicator" className="w-2 h-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold transition-colors ${databaseID === db.id ? 'text-primary' : 'text-foreground group-hover:text-primary/70'}`}>
                                                {db.label}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{db.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CreateExam;