import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Database, Plus, Trash2, Save, X, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";

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

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            id: prev.length + 1, title: "", description: "",
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
        if (!examTitle.trim()) { setErrorMsg("El título del examen es obligatorio."); return; }
        const startTime = buildStartTimeISO();
        if (!startTime) { setErrorMsg("Debes especificar fecha y hora de inicio."); return; }
        if (!durationMinutes || Number(durationMinutes) <= 0) { setErrorMsg("La duración debe ser mayor a 0."); return; }
        if (questions.length === 0) { setErrorMsg("Debes agregar al menos una pregunta."); return; }
        const validation = validateQuestions(questions);
        if (!validation.valid) { setErrorMsg(validation.error); return; }

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

    return (
        <div className="min-h-screen bg-background">

            {/* Navbar */}
            <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Database className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-foreground">QueryLogic</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/dashboard/teacher")}
                            className="gap-2 border-border text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSaveExam}
                            disabled={saving}
                            className="gap-2"
                            style={{ boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Guardando..." : "Guardar examen"}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Examen</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Define las preguntas y configuración del examen SQL
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                        <p className="text-sm text-destructive">{errorMsg}</p>
                    </div>
                )}

                {/* Layout 2 columnas */}
                <div className="grid grid-cols-[1fr_300px] gap-6">

                    {/* Columna izquierda */}
                    <div className="space-y-5">

                        {/* Info del examen */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-1">Información del examen</h2>
                            <p className="text-xs text-muted-foreground mb-5">Datos generales y configuración de tiempo</p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Título del examen
                                    </Label>
                                    <Input
                                        placeholder="ej: SQL Básico — Consultas SELECT"
                                        value={examTitle}
                                        onChange={e => setExamTitle(e.target.value)}
                                        style={{ background: 'rgba(17,19,31,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        placeholder="Breve descripción del examen..."
                                        rows={3}
                                        value={examDescription}
                                        onChange={e => setExamDescription(e.target.value)}
                                        style={{ background: 'rgba(17,19,31,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Fecha de inicio", id: "date", type: "date", value: deadlineDate, setter: setDeadlineDate },
                                        { label: "Hora de inicio", id: "time", type: "time", value: deadlineTime, setter: setDeadlineTime },
                                        { label: "Duración (min)", id: "dur", type: "number", value: durationMinutes, setter: setDurationMinutes },
                                    ].map(field => (
                                        <div key={field.id} className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                {field.label}
                                            </Label>
                                            <Input
                                                type={field.type}
                                                value={field.value}
                                                onChange={e => field.setter(e.target.value)}
                                                style={{ background: 'rgba(17,19,31,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        id="allowsRejoin"
                                        type="checkbox"
                                        className="h-4 w-4 accent-indigo-500"
                                        checked={allowsRejoin}
                                        onChange={e => setAllowsRejoin(e.target.checked)}
                                    />
                                    <Label htmlFor="allowsRejoin" className="text-sm text-muted-foreground cursor-pointer">
                                        Permitir reingresar al examen
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Preguntas */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">Preguntas</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Define las consultas SQL que deben resolver los estudiantes
                                    </p>
                                </div>
                                <Button size="sm" onClick={addQuestion} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Agregar pregunta
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="rounded-xl p-5 space-y-4"
                                        style={{ background: 'rgba(17,19,31,0.6)', border: '1px solid rgba(37,42,74,0.8)' }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-foreground">
                                                Pregunta {index + 1}
                                            </span>
                                            {questions.length > 1 && (
                                                <button
                                                    onClick={() => removeQuestion(question.id)}
                                                    className="text-xs text-destructive hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Título de la pregunta
                                            </Label>
                                            <Input
                                                placeholder="ej: Consulta de clientes activos"
                                                value={question.title}
                                                onChange={e => updateQuestionField(question.id, "title", e.target.value)}
                                                style={{ background: 'rgba(26,29,53,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Enunciado
                                            </Label>
                                            <Textarea
                                                placeholder="Describe la tarea que debe resolver el estudiante..."
                                                rows={2}
                                                value={question.description}
                                                onChange={e => updateQuestionField(question.id, "description", e.target.value)}
                                                style={{ background: 'rgba(26,29,53,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Consulta SQL esperada
                                                </Label>
                                                <Textarea
                                                    placeholder="SELECT nombre, pais FROM clientes ORDER BY nombre ASC;"
                                                    rows={3}
                                                    value={question.solutionExample}
                                                    onChange={e => updateQuestionField(question.id, "solutionExample", e.target.value)}
                                                    style={{
                                                        background: 'rgba(26,29,53,0.8)',
                                                        border: '1px solid rgba(99,102,241,0.15)',
                                                        fontFamily: '"JetBrains Mono", monospace',
                                                        fontSize: '12px',
                                                        color: '#a78bfa'
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Salida esperada
                                                </Label>
                                                <Textarea
                                                    placeholder="nombre | pais&#10;Alfreds | Germany&#10;Ana T. | Mexico"
                                                    rows={3}
                                                    value={question.expectedOutput}
                                                    onChange={e => updateQuestionField(question.id, "expectedOutput", e.target.value)}
                                                    style={{
                                                        background: 'rgba(26,29,53,0.8)',
                                                        border: '1px solid rgba(99,102,241,0.15)',
                                                        fontFamily: '"JetBrains Mono", monospace',
                                                        fontSize: '12px',
                                                        color: '#34d399'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Puntos
                                            </Label>
                                            <Input
                                                type="number"
                                                className="w-28"
                                                value={question.points}
                                                onChange={e => updateQuestionField(question.id, "points", e.target.value)}
                                                style={{ background: 'rgba(26,29,53,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar derecho */}
                    <div className="space-y-4">

                        {/* Resumen */}
                        <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">Resumen del examen</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Preguntas", value: questions.length, accent: true },
                                    { label: "Puntos totales", value: `${totalPoints} pts`, accent: false },
                                    { label: "Duración", value: durationMinutes ? `${durationMinutes} min` : "—", accent: false },
                                    { label: "Estado", value: "Borrador", accent: true },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                        <span className={`text-sm font-semibold ${item.accent ? 'text-primary' : 'text-foreground'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Base de datos */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Database className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">Base de datos</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { id: "", label: "Sin base de datos", sub: "Consultas libres" },
                                    { id: "db-usuarios", label: "Usuarios DB", sub: "importada" },
                                    { id: "db-productos", label: "Productos DB", sub: "importada" },
                                    { id: "db-biblioteca", label: "Biblioteca DB", sub: "importada" },
                                ].map(db => (
                                    <button
                                        key={db.id}
                                        onClick={() => setDatabaseID(db.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                                        style={{
                                            background: 'rgba(17,19,31,0.6)',
                                            border: databaseID === db.id
                                                ? '1px solid rgba(99,102,241,0.6)'
                                                : '1px solid rgba(37,42,74,0.8)',
                                        }}
                                    >
                                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ background: databaseID === db.id ? '#6366f1' : '#252A4A' }} />
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">{db.label}</p>
                                            <p className="text-xs text-muted-foreground">{db.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateExam;