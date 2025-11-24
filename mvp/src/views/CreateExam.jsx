import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, Plus, Trash2, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:3000

const CreateExam = () => {
    const navigate = useNavigate();

    // Exam-level state
    const [examTitle, setExamTitle] = useState("");
    const [examDescription, setExamDescription] = useState("");
    const [deadlineDate, setDeadlineDate] = useState(""); // yyyy-mm-dd
    const [deadlineTime, setDeadlineTime] = useState(""); // hh:mm
    const [durationMinutes, setDurationMinutes] = useState("60");
    const [databaseID, setDatabaseID] = useState("");
    const [allowsRejoin, setAllowsRejoin] = useState(false);

    const [questions, setQuestions] = useState([
        {
            id: 1,
            title: "",
            description: "",
            solutionExample: "",
            expectedOutput: "",
            points: 10,
        },
    ]);

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Add new question block
    const addQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            title: "",
            description: "",
            solutionExample: "",
            expectedOutput: "",
            points: 10,
        };
        setQuestions((prev) => [...prev, newQuestion]);
    };

    // Remove a question by id
    const removeQuestion = (id) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    // Update a field inside one question
    const updateQuestionField = (id, field, value) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id
                    ? {
                        ...q,
                        [field]: field === "points" ? Number(value) || 0 : value,
                    }
                    : q
            )
        );
    };

    // Build ISO string for StartTime
    const buildStartTimeISO = () => {
        if (!deadlineDate || !deadlineTime) return null;
        // Create a local datetime and convert to ISO
        const isoString = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
        return isoString;
    };

    // Validate questions before sending to backend
    const validateQuestions = (questions) => {
        // Return { valid: boolean, error: string | null }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const index = i + 1; // for user-friendly message

            if (!q.title.trim()) {
                return {
                    valid: false,
                    error: `La pregunta ${index} debe tener un título.`,
                };
            }

            if (!q.description.trim()) {
                return {
                    valid: false,
                    error: `La pregunta ${index} debe tener una descripción/enunciado.`,
                };
            }

            if (!q.solutionExample.trim()) {
                return {
                    valid: false,
                    error: `La pregunta ${index} debe tener una consulta SQL de ejemplo (solución).`,
                };
            }

            if (!q.expectedOutput.trim()) {
                return {
                    valid: false,
                    error: `La pregunta ${index} debe especificar la salida esperada.`,
                };
            }

            if (!q.points || q.points <= 0) {
                return {
                    valid: false,
                    error: `La pregunta ${index} debe tener puntos mayores a 0.`,
                };
            }
        }

        return { valid: true, error: null };
    };


    const handleSaveExam = async () => {
        setErrorMsg("");

        const token = useAuth().accessToken;
        console.log("[CreateExam] accessToken:", token);

        if (!token) {
            setErrorMsg("No hay sesión activa. Inicia sesión nuevamente.");
            navigate("/login");
            return;
        }

        // Validaciones básicas
        if (!examTitle.trim()) {
            setErrorMsg("El título del examen es obligatorio.");
            return;
        }

        const startTime = buildStartTimeISO();
        console.log("[CreateExam] startTime:", startTime);

        if (!startTime) {
            setErrorMsg("Debes especificar fecha y hora de inicio.");
            return;
        }

        if (!durationMinutes || Number(durationMinutes) <= 0) {
            setErrorMsg("La duración debe ser un número mayor a 0.");
            return;
        }

        if (questions.length === 0) {
            setErrorMsg("Debes agregar al menos una pregunta.");
            return;
        }

        const questionsValidation = validateQuestions(questions);
        if (!questionsValidation.valid) {
            setErrorMsg(questionsValidation.error);
            return;
        }

        const mappedQuestions = questions.map((q) => ({
            QuestionTitle: q.title,
            QuestionText: q.description,
            ExpectedOutput: q.expectedOutput
                ? { text: q.expectedOutput }
                : null,
            SolutionExample: q.solutionExample,
            Value: q.points || 0,
        }));

        const payload = {
            Title: examTitle,
            Description: examDescription || null,
            StartTime: startTime,
            Duration: Number(durationMinutes),
            DatabaseID: databaseID || null,
            AllowsRejoin: allowsRejoin,
            questions: mappedQuestions,
        };

        console.log("[CreateExam] API_URL:", API_URL);
        console.log("[CreateExam] Payload:", payload);

        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/exams`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            console.log("[CreateExam] Response status:", res.status);

            const data = await res.json().catch(() => ({}));
            console.log("[CreateExam] Response JSON:", data);

            if (!res.ok) {
                throw new Error(data.message || `Error al crear el examen (${res.status})`);
            }

            // Success
            navigate("/dashboard/teacher");
        } catch (err) {
            console.error("[CreateExam] Error:", err);
            setErrorMsg(err.message || "Error inesperado al guardar el examen");
        } finally {
            setSaving(false);
        }
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
                        <Button onClick={handleSaveExam} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Guardando..." : "Guardar Examen"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard/teacher")}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Crear Nuevo Examen
                    </h1>
                    <p className="text-muted-foreground">
                        Define las preguntas y configuración del examen SQL
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 text-sm text-red-500">
                        {errorMsg}
                    </div>
                )}

                {/* Exam Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Información del Examen</CardTitle>
                        <CardDescription>Datos generales del examen</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="examTitle">Título del Examen</Label>
                            <Input
                                id="examTitle"
                                placeholder="ej: SQL Básico - Consultas SELECT"
                                value={examTitle}
                                onChange={(e) => setExamTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="examDescription">Descripción</Label>
                            <Textarea
                                id="examDescription"
                                placeholder="Breve descripción del examen..."
                                value={examDescription}
                                onChange={(e) => setExamDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="deadlineDate">Fecha de inicio</Label>
                                <Input
                                    id="deadlineDate"
                                    type="date"
                                    value={deadlineDate}
                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadlineTime">Hora de inicio</Label>
                                <Input
                                    id="deadlineTime"
                                    type="time"
                                    value={deadlineTime}
                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duración (minutos)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    placeholder="60"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="allowsRejoin"
                                type="checkbox"
                                className="h-4 w-4"
                                checked={allowsRejoin}
                                onChange={(e) => setAllowsRejoin(e.target.checked)}
                            />
                            <Label htmlFor="allowsRejoin" className="cursor-pointer">
                                Permitir reingresar al examen
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">Preguntas</h2>
                        <Button onClick={addQuestion} type="button">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Pregunta
                        </Button>
                    </div>

                    {questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Pregunta {index + 1}</CardTitle>
                                    {questions.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            type="button"
                                            onClick={() => removeQuestion(question.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Título de la Pregunta</Label>
                                    <Input
                                        placeholder="ej: Consulta de usuarios activos"
                                        value={question.title}
                                        onChange={(e) =>
                                            updateQuestionField(question.id, "title", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción/Enunciado</Label>
                                    <Textarea
                                        placeholder="Describe la tarea que debe realizar el estudiante..."
                                        rows={3}
                                        value={question.description}
                                        onChange={(e) =>
                                            updateQuestionField(question.id, "description", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Consulta SQL Ejemplo (Solución)</Label>
                                        <Textarea
                                            placeholder="SELECT * FROM usuarios WHERE activo = 1;"
                                            rows={3}
                                            className="font-mono text-sm"
                                            value={question.solutionExample}
                                            onChange={(e) =>
                                                updateQuestionField(
                                                    question.id,
                                                    "solutionExample",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Salida Esperada</Label>
                                        <Textarea
                                            placeholder="Describe o muestra el resultado esperado"
                                            rows={3}
                                            value={question.expectedOutput}
                                            onChange={(e) =>
                                                updateQuestionField(
                                                    question.id,
                                                    "expectedOutput",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Puntos</Label>
                                    <Input
                                        type="number"
                                        className="w-32"
                                        value={question.points}
                                        onChange={(e) =>
                                            updateQuestionField(question.id, "points", e.target.value)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Database Selection */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Base de Datos</CardTitle>
                        <CardDescription>
                            Selecciona la base de datos para este examen
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label>Base de datos disponibles</Label>
                            <select
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                value={databaseID}
                                onChange={(e) => setDatabaseID(e.target.value)}
                            >
                                <option value="">Sin base de datos específica</option>
                                {/* TODO: replace with real DB IDs from backend */}
                                <option value="db-usuarios">Base de datos: Usuarios</option>
                                <option value="db-productos">Base de datos: Productos</option>
                                <option value="db-biblioteca">Base de datos: Biblioteca</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 flex gap-4">
                    <Button
                        className="flex-1"
                        size="lg"
                        onClick={handleSaveExam}
                        disabled={saving}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Guardando..." : "Guardar Examen"}
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/dashboard/teacher")}
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateExam;
