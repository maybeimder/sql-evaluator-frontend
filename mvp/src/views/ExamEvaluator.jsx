import { Button } from "@/components/ui/button";
import { Database, Play, CheckCircle2, LogOut, Code2, Terminal, Database as DbIcon, Info, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";
import manualUrl from "../assets/manual.html?url";

const API_URL = import.meta.env.VITE_API_URL;

const ExamEvaluator = () => {
    const navigate = useNavigate();
    const { examID } = useParams();
    const { state } = useLocation();
    const { accessToken: token } = useAuth();

    const [sqlCode, setSqlCode] = useState("");
    const [answers, setAnswers] = useState({});
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);
    const [timeUp, setTimeUp] = useState(false);
    const [executionTime, setExecutionTime] = useState(null);
    const timerRef = useRef(null);
    const endTimeRef = useRef(null);
    const latestAssignmentID = useRef(state?.assignmentID ?? null);

    const [questionsArray, setQuestionsArray] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [assignmentID, setAssignmentID] = useState(state?.assignmentID ?? null);
    const [examInfo, setExamInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [questionPanelOpen, setQuestionPanelOpen] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [answerOutput, setAnswerOutput] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [dbSchema, setDbSchema] = useState(null);
    const [schemaOpen, setSchemaOpen] = useState(true);
    const [examType, setExamType] = useState(null);

    const currentQuestion = questionsArray[currentQuestionIndex] ? {
        questionID: questionsArray[currentQuestionIndex].QuestionID,
        title: questionsArray[currentQuestionIndex].QuestionTitle,
        description: questionsArray[currentQuestionIndex].QuestionText,
        expectedRows: (() => {
            const eo = questionsArray[currentQuestionIndex].ExpectedOutput;
            if (eo === null || eo === undefined) return null;
            if (typeof eo === "number") return eo;
            if (typeof eo === "object" && !Array.isArray(eo)) return eo.rowCount ?? null;
            return null;
        })(),
        expectedOutputArray: (() => {
            const eo = questionsArray[currentQuestionIndex].ExpectedOutput;
            if (eo && typeof eo === "object" && !Array.isArray(eo) && Array.isArray(eo.outputs)) return eo.outputs;
            return null;
        })(),
        inputs: (() => {
            const eo = questionsArray[currentQuestionIndex].ExpectedOutput;
            if (eo && typeof eo === "object" && !Array.isArray(eo) && Array.isArray(eo.inputs)) return eo.inputs;
            return [];
        })(),
        points: questionsArray[currentQuestionIndex].Value,
        tableSchema: questionsArray[currentQuestionIndex].TableSchema
            ?? questionsArray[currentQuestionIndex].Schema
            ?? null,
    } : null;

    const totalQuestions = questionsArray.length;
    const allowsRejoin = examInfo?.AllowsRejoin ?? true;


    // Fetch questions
    useEffect(() => {
        fetch(`${API_URL}/exams/id/${examID}/questions`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        })
            .then(r => r.json())
            .then(data => {
                console.log("[ExamEvaluator] questions response:", data);
                setQuestionsArray(data.questions ?? []);
                setLoading(false);
            })
            .catch(err => {
                console.error("[ExamEvaluator] error cargando preguntas:", err);
                setLoading(false);
            });
    }, [examID]);

    // Resolve assignmentID + Type + DatabaseID from the student's exam list, then fetch schema if SQL
    useEffect(() => {
        fetch(`${API_URL}/exams`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(list => {
                const exams = Array.isArray(list) ? list : (list.exams ?? []);
                // eslint-disable-next-line eqeqeq
                const match = exams.find(e => e.ExamID == examID);
                if (!match) return null;
                if (!assignmentID && match.AssignmentID) {
                    setAssignmentID(match.AssignmentID);
                    latestAssignmentID.current = match.AssignmentID;
                }
                if (match.EndTime) {
                    const timerEnd = new Date(match.EndTime);
                    endTimeRef.current = timerEnd;
                    setRemainingTime(Math.max(0, Math.floor((timerEnd - new Date()) / 1000)));
                }
                const type = match.Type ?? "SQL";
                setExamType(type);
                if (type === "PSEUDOCODE") return null;
                const databaseID = match.DatabaseID ?? null;
                if (!databaseID) return null;
                return fetch(`${API_URL}/databases/id/${databaseID}/schema`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            })
            .then(r => r?.json())
            .then(data => { if (data?.ok) setDbSchema(data.schema); })
            .catch(() => { });
    }, [examID]);


    // Timer — computes remaining seconds from EndTime on every tick
    useEffect(() => {
        timerRef.current = setInterval(() => {
            if (!endTimeRef.current) return;
            const remaining = Math.max(0, Math.floor((endTimeRef.current - new Date()) / 1000));
            setRemainingTime(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current);
                setTimeUp(true);
            }
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    // Auto-submit when time runs out
    useEffect(() => {
        if (!timeUp) return;
        fetch(`${API_URL}/assignments/id/${latestAssignmentID.current ?? examID}/finish`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        }).catch(() => {}).finally(() => {
            setTimeout(() => navigate("/dashboard/student"), 3000);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeUp]);

    if (loading) return <p>Cargando preguntas...</p>;

    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleRunQuery = async () => {
        if (!sqlCode.trim()) return;
        const isPseudo = examType === "PSEUDOCODE";
        console.log(currentQuestion)
        if (!assignmentID || !currentQuestion?.questionID) return;

        console.log("[ExamEvaluator] submit", { isPseudo, assignmentID, questionID: currentQuestion.questionID, codeLen: sqlCode.length });

        setIsExecuting(true);
        setComparisonResult(null);
        setAnswerOutput(null);
        setOutput("");
        const start = performance.now();
        try {
            const res = isPseudo
                ? await fetch(`${API_URL}/assignments/id/${assignmentID}/pseudocode`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    credentials: "include",
                    body: JSON.stringify({ code: sqlCode, inputs: currentQuestion?.inputs ?? [], questionID: currentQuestion?.questionID }),
                })
                : await fetch(`${API_URL}/assignments/id/${assignmentID}/submit`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    credentials: "include",
                    body: JSON.stringify({ questionID: currentQuestion.questionID, answer: sqlCode }),
                });

            const data = await res.json();
            const elapsed = performance.now() - start;
            setExecutionTime(elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`);

            if (!res.ok) {
                setOutput(data.error ?? "Error al ejecutar el código");
                setComparisonResult("incorrect");
                return;
            }

            if (data.errorMessage) {
                setOutput(data.errorMessage);
                setComparisonResult("incorrect");
                return;
            }

            const ao = data.answerOutput;
            setAnswerOutput(ao);

            if (isPseudo) {
                const outputs = ao?.outputs ?? [];
                setOutput(outputs.length > 0 ? outputs.join("\n") : "(sin salida)");
            } else {
                const fields = ao?.fields ?? [];
                const rows = ao?.rows ?? [];
                const rowCount = ao?.rowCount ?? 0;
                let text = `${rowCount} fila(s) encontradas`;
                if (fields.length > 0) {
                    text += "\n\n" + fields.join(" | ");
                    text += "\n" + rows.slice(0, 8).map(r => fields.map(f => String(r[f] ?? "")).join(" | ")).join("\n");
                    if (rows.length > 8) text += `\n... y ${rows.length - 8} más`;
                }
                setOutput(text);
            }

            if (data.isCorrect !== null && data.isCorrect !== undefined) {
                setComparisonResult(data.isCorrect ? "correct" : "incorrect");
            } else if (!isPseudo && currentQuestion?.expectedRows !== null) {
                setComparisonResult(
                    (ao?.rowCount === currentQuestion.expectedRows) ? "correct" : "incorrect"
                );
            }
        } catch (err) {
            setOutput(err.message ?? "Error de conexión");
            setComparisonResult("incorrect");
        } finally {
            setIsExecuting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const handleSubmitExam = async () => {
        setIsSubmitting(true);
        setSubmitError("");
        try {
            const res = await fetch(`${API_URL}/assignments/id/${assignmentID ?? examID}/finish`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al enviar el examen");
            setShowSubmitModal(false);
            setSubmitSuccess(true);
            setTimeout(() => navigate("/dashboard/student"), 2000);
        } catch {
            setSubmitError("Error al enviar el examen. Intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigateQuestion = (newIndex) => {
        // Save current answer before leaving
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: sqlCode }));
        // Restore saved answer for the new question (or empty if never visited)
        setSqlCode(answers[newIndex] ?? "");
        setCurrentQuestionIndex(newIndex);
        setOutput("");
        setComparisonResult(null);
        setAnswerOutput(null);
        setExecutionTime(null);
    };

    const handleExitConfirm = async () => {
        if (!allowsRejoin) {
            await handleSubmitExam();
        } else {
            navigate("/dashboard/student");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#0d0f1a] overflow-hidden font-sans text-foreground" style={{ minHeight: '100dvh' }}>

            {/* Exit Confirmation Modal */}
            <AnimatePresence>
                {showExitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-[#111320] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground mb-1">
                                        {allowsRejoin ? "¿Salir sin guardar?" : "¿Seguro que quieres salir?"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {allowsRejoin
                                            ? "Puedes volver a ingresar más tarde. El tiempo seguirá corriendo mientras estés fuera."
                                            : "Este examen no permite volver a ingresar. Al salir, el examen se enviará automáticamente."}
                                    </p>
                                </div>
                            </div>

                            {!allowsRejoin && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                                    <span className="text-red-400 text-xs font-bold">⚠</span>
                                    <p className="text-xs text-red-400">
                                        Este es tu único intento. Si sales, tu examen se enviará con las respuestas actuales.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                                    onClick={() => setShowExitModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className={`flex-1 transition-colors ${!allowsRejoin
                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        }`}
                                    onClick={handleExitConfirm}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Enviando...</>
                                    ) : allowsRejoin ? "Salir" : "Salir y Enviar"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time Up Overlay */}
            <AnimatePresence>
                {timeUp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="bg-[#111320] border border-red-500/20 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                                <Clock className="h-8 w-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">¡Se acabó el tiempo!</h2>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                Tu tiempo ha expirado. Tus respuestas están siendo enviadas automáticamente.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                Enviando y redirigiendo...
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Confirmation Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-[#111320] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground mb-1">¿Enviar examen?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Esta acción es definitiva. Una vez enviado no podrás modificar tus respuestas.
                                    </p>
                                </div>
                            </div>

                            <div className="mb-5 p-3 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Preguntas respondidas</span>
                                    <span className="font-bold text-foreground">
                                        {Object.keys(answers).filter(k => answers[k]?.trim()).length + (sqlCode.trim() ? 1 : 0)} / {totalQuestions}
                                    </span>
                                </div>
                                {remainingTime !== null && remainingTime > 0 && (
                                    <div className="flex items-center justify-between text-xs mt-2">
                                        <span className="text-muted-foreground">Tiempo restante</span>
                                        <span className="font-mono font-bold text-foreground">{formatTime(remainingTime)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                                    onClick={() => setShowSubmitModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className="flex-1 transition-colors"
                                    onClick={handleSubmitExam}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Enviando...</>
                                    ) : "Enviar Examen"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header General */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-14 border-b border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0 z-50 relative"
            >
                <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                            <Database className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-base font-bold text-foreground tracking-wide hidden sm:block">QueryLogic<span className="text-muted-foreground font-normal ml-2">| Evaluador</span></span>
                    </div>

                    {/* Question progress indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-black/30 px-4 py-1.5 rounded-full border border-white/5">
                        {Array.from({ length: totalQuestions }, (_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentQuestionIndex ? 'w-6 bg-primary shadow-[0_0_6px_rgba(99,102,241,0.6)]' : 'w-4 bg-white/10'}`}></div>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1.5">{currentQuestionIndex + 1}/{totalQuestions}</span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-4">
                        <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${remainingTime <= 300 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
                            <Clock className="h-3 w-3" />
                            {formatTime(remainingTime)}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowExitModal(true)}
                            className="text-muted-foreground hover:text-white hover:bg-white/5 transition-colors h-8 text-xs hidden sm:flex"
                        >
                            <LogOut className="h-3.5 w-3.5 sm:mr-2" />
                            <span className="hidden sm:inline">Salir sin guardar</span>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowSubmitModal(true)}
                            disabled={isSubmitting || submitSuccess}
                            className="h-8 text-xs gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : submitSuccess ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                    ¡Enviado!
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Enviar Examen</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.header>

            {submitError && (
                <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-2 text-xs text-destructive text-center">
                    {submitError}
                </div>
            )}
            {submitSuccess && (
                <div className="bg-success/10 border-b border-success/20 px-6 py-2 text-xs text-success text-center">
                    ✓ Examen enviado correctamente. Redirigiendo...
                </div>
            )}

            {/* Main Layout */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 flex flex-col md:flex-row min-h-0 relative"
            >

                {/* Panel Izquierdo (Pregunta) — collapsible on mobile */}
                <motion.div variants={itemVariants} className="flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-[#111320]/80 backdrop-blur-md z-10 md:w-[35%] lg:w-[30%] md:flex-shrink-0">
                    {/* Mobile: tap-to-expand toggle bar */}
                    <div
                        className="flex md:hidden items-center justify-between px-4 py-3 cursor-pointer border-b border-white/5 active:bg-white/5 transition-colors"
                        onClick={() => setQuestionPanelOpen(o => !o)}
                    >
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">Pregunta {currentQuestionIndex + 1} de {totalQuestions}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{currentQuestion?.points} pts</span>
                            {questionPanelOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    </div>

                    {/* Panel body — always visible on md+, collapsible on mobile */}
                    <div className={`${questionPanelOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-h-0`}>
                        {/* Header Pregunta */}
                        <div className="p-4 sm:p-5 border-b border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                                    Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                    {currentQuestion?.points} <span className="text-muted-foreground font-normal">pts</span>
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-foreground leading-tight mb-2">
                                {currentQuestion?.title}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                                    {examType ?? "SQL"}
                                </span>
                            </div>
                        </div>

                        {/* Contenido Pregunta (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">

                            {/* DB Schema — solo SQL */}
                            {examType !== "PSEUDOCODE" && dbSchema && (
                                <div className="rounded-xl border border-white/5 bg-[#090a10] overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setSchemaOpen(o => !o)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <DbIcon className="h-3.5 w-3.5 text-primary/70" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Esquema de la DB</span>
                                        </div>
                                        {schemaOpen
                                            ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        }
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {schemaOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden border-t border-white/5"
                                            >
                                                <div className="p-3 space-y-3">
                                                    {Object.entries(dbSchema).map(([table, cols]) => (
                                                        <div key={table}>
                                                            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1.5 font-mono">
                                                                {table}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {cols.map(col => (
                                                                    <span
                                                                        key={col.column}
                                                                        className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5"
                                                                    >
                                                                        <span className="text-foreground/80">{col.column}</span>
                                                                        <span className="text-muted-foreground/60">{col.type}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <div className="text-sm text-foreground/90 leading-relaxed">
                                <p>{currentQuestion?.description}</p>
                            </div>

                            {/* Esquema de Tabla — only shown if API provides it */}
                            {currentQuestion?.type === "SQL" && currentQuestion?.tableSchema && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <DbIcon className="h-3.5 w-3.5 text-primary/60" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Esquema de la Tabla</h4>
                                    </div>
                                    <div className="bg-[#090a10] border border-white/5 rounded-xl p-3 relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-primary/50 transition-colors"></div>
                                        <pre className="text-[13px] text-muted-foreground font-mono leading-relaxed pl-2 overflow-x-auto">
                                            {currentQuestion.tableSchema}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Pseudocódigo: entradas y salida esperada */}
                            {examType === "PSEUDOCODE" && (
                                <div className="space-y-3">
                                    {/* Entradas */}
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Info className="h-3.5 w-3.5 text-indigo-400/60" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400/60">Entradas</h4>
                                        </div>
                                        <div className="bg-[#090a10] border border-white/5 rounded-xl p-3 flex flex-wrap gap-1.5">
                                            {(currentQuestion?.inputs ?? []).length > 0
                                                ? (currentQuestion.inputs).map((v, i) => (
                                                    <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                                                        {v}
                                                    </span>
                                                ))
                                                : <span className="text-xs text-muted-foreground italic">Sin entradas</span>
                                            }
                                        </div>
                                    </div>
                                    {/* Salida esperada */}
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Info className="h-3.5 w-3.5 text-emerald-400/60" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400/60">Salida Esperada</h4>
                                        </div>
                                        <div className="bg-[#090a10] border border-white/5 rounded-xl p-3 flex flex-wrap gap-1.5">
                                            {(currentQuestion?.expectedOutputArray ?? []).length > 0
                                                ? (currentQuestion.expectedOutputArray).map((v, i) => (
                                                    <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                                                        {v}
                                                    </span>
                                                ))
                                                : <span className="text-xs text-muted-foreground italic">Sin salida definida</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SQL: Filas Esperadas */}
                            {examType !== "PSEUDOCODE" && currentQuestion?.expectedRows !== null && currentQuestion?.expectedRows !== undefined && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Info className="h-3.5 w-3.5 text-success/60" />
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-success/60">Filas Esperadas</h4>
                                    </div>
                                    <div className="bg-[#090a10] border border-white/5 rounded-xl p-3 relative overflow-hidden group flex items-center gap-3">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-green-500/50 transition-colors"></div>
                                        <span className="text-2xl font-black text-green-400 pl-2">{currentQuestion.expectedRows}</span>
                                        <span className="text-xs text-muted-foreground">filas</span>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Navegación Footer */}
                        <div className="p-4 border-t border-white/5 flex gap-3 bg-black/20">
                            <Button
                                variant="outline"
                                className="flex-1 h-9 text-xs gap-1 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => navigateQuestion(currentQuestionIndex - 1)}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Anterior
                            </Button>
                            <Button
                                className="flex-1 h-9 text-xs gap-1 border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary transition-all shadow-none disabled:opacity-40"
                                disabled={currentQuestionIndex === totalQuestions - 1}
                                onClick={() => navigateQuestion(currentQuestionIndex + 1)}
                            >
                                Siguiente
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Panel Derecho (Editor + Output) */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#0d0f1a] relative z-0">

                    {/* Top Half: Editor */}
                    <motion.div variants={itemVariants} className="flex-1 flex flex-col min-h-[50%] border-b border-white/10">
                        {/* Editor Toolbar */}
                        <div className="h-12 bg-[#151828] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Code2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-foreground/80 tracking-wide">Espacio de trabajo</span>
                                {examType === "PSEUDOCODE" && (
                                    <a
                                        href={manualUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-md transition-all duration-200"
                                    >
                                        📖 Manual
                                    </a>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={handleRunQuery}
                                disabled={isExecuting}
                                className="h-8 gap-1.5 bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                {isExecuting ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-black/30 border-t-black/80 rounded-full animate-spin"></div>
                                        Ejecutando...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5" />
                                        Ejecutar Código
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 relative bg-[#090a10]">
                            <Textarea
                                value={sqlCode}
                                onChange={(e) => setSqlCode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Tab") {
                                        e.preventDefault();
                                        const el = e.currentTarget;
                                        const start = el.selectionStart;
                                        const end = el.selectionEnd;
                                        const tab = "    ";
                                        setSqlCode(prev => prev.substring(0, start) + tab + prev.substring(end));
                                        requestAnimationFrame(() => {
                                            el.selectionStart = el.selectionEnd = start + tab.length;
                                        });
                                    }
                                }}
                                className="absolute inset-0 pl-14 pr-4 py-4 w-full h-full font-mono text-[14px] bg-transparent text-[#e2e8f0] border-none resize-none focus-visible:ring-0 leading-relaxed"
                                placeholder={examType === "PSEUDOCODE"
                                    ? "Algoritmo SUMA\n    Entrada a, b\n    Salida a + b\nFinAlgoritmo"
                                    : "SELECT * FROM usuarios WHERE edad > 18;"
                                }
                                spellCheck="false"
                                style={{ tabSize: 4 }}
                            />
                        </div>
                    </motion.div>

                    {/* Bottom Half: Output Console */}
                    <motion.div variants={itemVariants} className="h-1/3 min-h-[200px] flex flex-col bg-[#090a10]">
                        {/* Console Toolbar */}
                        <div className="h-10 bg-[#111320] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Consola de Salida</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {comparisonResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                        style={comparisonResult === "correct" ? {
                                            background: 'rgba(52,211,153,0.1)',
                                            border: '1px solid rgba(52,211,153,0.3)',
                                            color: '#34d399'
                                        } : {
                                            background: 'rgba(248,113,113,0.1)',
                                            border: '1px solid rgba(248,113,113,0.3)',
                                            color: '#f87171'
                                        }}
                                    >
                                        {comparisonResult === "correct" ? (
                                            <><CheckCircle2 className="h-3 w-3" /> Correcto</>
                                        ) : (
                                            <><span>✕</span> Incorrecto</>
                                        )}
                                    </motion.div>
                                )}
                                {executionTime !== null && (
                                    <span className="text-[10px] font-mono text-muted-foreground/70 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        {executionTime}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Console Output Area */}
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
                            <AnimatePresence mode="wait">
                                {output && (
                                    <motion.div
                                        key="output"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3"
                                    >
                                        {/* Raw output */}
                                        <pre className="text-[12px] font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                            {output}
                                        </pre>

                                        {/* Comparison block */}
                                        {comparisonResult && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="rounded-xl border p-4"
                                                style={comparisonResult === "correct" ? {
                                                    background: 'rgba(52,211,153,0.05)',
                                                    borderColor: 'rgba(52,211,153,0.2)'
                                                } : {
                                                    background: 'rgba(248,113,113,0.05)',
                                                    borderColor: 'rgba(248,113,113,0.2)'
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    {comparisonResult === "correct"
                                                        ? <CheckCircle2 className="h-4 w-4 text-success" />
                                                        : <span className="text-destructive text-sm">✕</span>
                                                    }
                                                    <span className="text-xs font-bold uppercase tracking-wider"
                                                        style={{ color: comparisonResult === "correct" ? '#34d399' : '#f87171' }}>
                                                        {comparisonResult === "correct" ? "¡Resultado correcto!" : "El resultado no coincide"}
                                                    </span>
                                                </div>

                                                {examType === "PSEUDOCODE" ? (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Salida esperada</p>
                                                            <div className="bg-black/30 rounded-lg p-3 border border-white/5 flex flex-wrap gap-1">
                                                                {(currentQuestion?.expectedOutputArray ?? []).map((v, i) => (
                                                                    <span key={i} className="text-xs font-mono font-bold text-emerald-400/80">{v}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Tu salida</p>
                                                            <div className="bg-black/30 rounded-lg p-3 border border-white/5 flex flex-wrap gap-1">
                                                                {(answerOutput?.outputs ?? []).length > 0
                                                                    ? (answerOutput.outputs).map((v, i) => (
                                                                        <span key={i} className="text-xs font-mono font-bold" style={{ color: comparisonResult === "correct" ? '#34d399' : '#f87171' }}>{String(v)}</span>
                                                                    ))
                                                                    : <span className="text-xs text-muted-foreground italic">Sin salida</span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Filas esperadas</p>
                                                            <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                                                                <span className="text-xl font-black text-success/80">{currentQuestion?.expectedRows}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Filas obtenidas</p>
                                                            <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                                                                <span className="text-xl font-black" style={{ color: comparisonResult === "correct" ? '#34d399' : '#f87171' }}>
                                                                    {answerOutput?.rowCount ?? 0}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExamEvaluator;
