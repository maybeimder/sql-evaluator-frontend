import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Database, Code2, Terminal, Lightbulb, Scale } from "lucide-react";
import { motion } from "framer-motion";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

const parseOutput = (text) => {
    if (!text || typeof text !== "string") return { headers: [], rows: [] };

    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };

    const rows = lines.map((line) =>
        line
            .trim()
            .split(/\s*\|\s*|\s{2,}/)
            .filter((cell) => cell !== "")
    );

    return {
        headers: rows[0],
        rows: rows.slice(1),
    };
};

const OutputTable = ({ text, type = "student" }) => {
    const { headers, rows } = parseOutput(text);

    if (!headers.length) {
        return (
            <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-white/10 bg-white/[0.01] text-xs text-muted-foreground italic">
                (Salida vacía)
            </div>
        );
    }

    const isExpected = type === "expected";
    const bgClass = isExpected ? "bg-muted/10 border-white/5" : "bg-card/40 border-white/10";
    const highlightClass = isExpected ? "group-hover:bg-muted/20" : "group-hover:bg-white/[0.03]";

    return (
        <div className={`rounded-xl border overflow-x-auto transition-colors duration-300 ${bgClass}`}>
            <Table className="text-sm font-mono whitespace-nowrap min-w-full">
                <TableHeader className={isExpected ? "bg-black/20" : "bg-white/[0.02]"}>
                    <TableRow className="border-b border-white/5 hover:bg-transparent">
                        {headers.map((h, i) => (
                            <TableHead key={i} className={`h-10 px-4 text-xs font-semibold ${isExpected ? "text-muted-foreground" : "text-foreground/80"}`}>{h}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r, i) => (
                        <TableRow key={i} className={`border-b border-white/5 last:border-0 transition-colors duration-200 group ${highlightClass}`}>
                            {r.map((cell, j) => (
                                <TableCell key={j} className={`px-4 py-2 text-xs ${isExpected ? "text-muted-foreground" : "text-foreground"}`}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const CodeBlock = ({ code, title, icon: Icon, isReference = false }) => (
    <div className={`rounded-xl overflow-hidden border ${isReference ? 'border-primary/20 bg-primary/[0.02]' : 'border-white/10 bg-black/40'} shadow-sm h-full flex flex-col`}>
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isReference ? 'border-primary/10 bg-primary/[0.05]' : 'border-white/5 bg-white/[0.02]'}`}>
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${isReference ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${isReference ? 'text-primary' : 'text-muted-foreground'}`}>{title}</span>
            </div>
            <div className="flex gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${isReference ? 'bg-primary/20' : 'bg-white/10'}`}></div>
                <div className={`w-2.5 h-2.5 rounded-full ${isReference ? 'bg-primary/20' : 'bg-white/10'}`}></div>
                <div className={`w-2.5 h-2.5 rounded-full ${isReference ? 'bg-primary/20' : 'bg-white/10'}`}></div>
            </div>
        </div>
        <div className="p-4 overflow-x-auto flex-1">
            <pre className={`text-sm font-mono ${isReference ? 'text-primary/90' : 'text-foreground/90'}`}>
                <code>{code?.trim()}</code>
            </pre>
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// MOCK de datos (luego lo reemplazas con fetch)
// ---------------------------------------------------------------------------
const mockExamDetails = {
    "1": {
        id: 1,
        title: "Funciones Agregadas",
        professor: "María González",
        date: "2024-01-10",
        score: 85,
        questions: [
            {
                id: 1,
                questionTitle: "Total de ventas por cliente",
                questionText: "Obtén el total de ventas por cliente usando SUM().",
                solutionExample: `
SELECT cliente_id, SUM(monto) AS total
FROM ventas
GROUP BY cliente_id;`,
                expectedOutput: {
                    text: `
cliente_id | total
1          | 300
2          | 150
          `,
                },
                studentQuery: `
SELECT cliente_id, SUM(monto) AS total
FROM ventas
GROUP BY cliente_id;`,
                studentOutput: {
                    text: `
cliente_id | total
1          | 300
2          | 150
          `,
                },
                maxScore: 20,
                awardedScore: 20,
                isCorrect: true,
            },
            {
                id: 2,
                questionTitle: "Cantidad de pedidos por cliente",
                questionText: "Cuenta cuántos pedidos tiene cada cliente.",
                solutionExample: `
SELECT cliente_id, COUNT(*) AS total_pedidos
FROM pedidos
GROUP BY cliente_id;`,
                expectedOutput: {
                    text: `
cliente_id | total_pedidos
1          | 5
2          | 3
          `,
                },
                studentQuery: `
SELECT cliente_id, COUNT(*) AS total_pedidos
FROM pedidos
GROUP BY cliente_id;`,
                studentOutput: {
                    text: `
cliente_id | total_pedidos
1          | 5
2          | 2
          `,
                },
                maxScore: 20,
                awardedScore: 10,
                isCorrect: false,
            },
        ],
    },
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
const ExamDetailStudent = () => {
    const { id } = useParams(); // /exams/:id
    const navigate = useNavigate();

    const exam = mockExamDetails[id];

    if (!exam) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-lg text-muted-foreground">
                        No se encontraron detalles para este examen.
                    </p>
                    <Button variant="outline" onClick={() => navigate("/dashboard/student")}>
                        Volver al panel
                    </Button>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">
            {/* Header */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 group-hover:shadow-primary/40 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">QueryLogic</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/student")}
                        className="text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2 active:scale-95 transition-all duration-200 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Volver al panel</span>
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8"
                >
                    {/* Resumen del examen */}
                    <motion.div variants={itemVariants}>
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors duration-500 group-hover:bg-primary/10"></div>

                            <CardContent className="p-6 sm:p-8 relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Resultados del Examen</p>
                                    <h1 className="text-3xl font-bold text-foreground mb-3">{exam.title}</h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5"><Database className="h-4 w-4 opacity-70" /> Prof. {exam.professor}</span>
                                            <span className="hidden sm:inline text-white/20">•</span>
                                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 opacity-70" /> Completado: {exam.date}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center sm:items-end bg-black/30 p-5 rounded-2xl border border-success/10 shadow-[0_0_20px_rgba(52,211,153,0.05)]">
                                        <div className="relative">
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted/20" />
                                                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-success transition-all duration-1000 ease-out" strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * exam.score) / 100} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xl font-bold text-success">{exam.score}%</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-3">Nota Final</span>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 sm:p-5 bg-primary/5 border border-primary/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 group/info hover:bg-primary/10 transition-colors duration-300">
                                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                        <Scale className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">Criterio de Evaluación de Lógica</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Evaluamos que tu consulta SQL produzca exactamente el mismo conjunto de datos (columnas y filas) que la <strong className="text-foreground/80">salida esperada</strong>. La solución de referencia mostrada es solo una forma de resolverlo; otras consultas con diferente sintaxis pero misma salida son igualmente válidas.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Preguntas */}
                    <div className="space-y-6">
                        {exam.questions.map((q, index) => (
                            <motion.div variants={itemVariants} key={q.id}>
                                <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-lg group">
                                    <CardHeader className="border-b border-white/5 bg-white/[0.01] p-5 sm:p-6">
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 shadow-sm">
                                                        {index + 1}
                                                    </span>
                                                    <CardTitle className="text-lg sm:text-xl text-foreground">
                                                        {q.questionTitle}
                                                    </CardTitle>
                                                </div>
                                                <CardDescription className="text-sm text-foreground/70 sm:pl-11">
                                                    {q.questionText}
                                                </CardDescription>
                                            </div>

                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2">
                                                {q.isCorrect ? (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                                        <CheckCircle2 className="h-4 w-4" /> Correcto
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(248,113,113,0.1)]">
                                                        <XCircle className="h-4 w-4" /> Incorrecto
                                                    </div>
                                                )}
                                                <p className="text-xs font-medium text-muted-foreground bg-black/20 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1">
                                                    <span className={`font-bold ${q.isCorrect ? "text-success" : "text-destructive"}`}>{q.awardedScore}</span>
                                                    <span>/ {q.maxScore} pts</span>
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 sm:p-6 space-y-8">
                                        {/* Soluciones SQL */}
                                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                            <CodeBlock
                                                code={q.studentQuery}
                                                title="Tu solución"
                                                icon={Code2}
                                            />
                                            {q.solutionExample && (
                                                <CodeBlock
                                                    code={q.solutionExample}
                                                    title="Solución de referencia"
                                                    icon={Lightbulb}
                                                    isReference={true}
                                                />
                                            )}
                                        </div>

                                        {/* Comparación de Salidas */}
                                        <div className="pt-2">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Terminal className="h-4 w-4 text-muted-foreground" />
                                                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Comparación de Resultados</h4>
                                            </div>
                                            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 bg-black/20 p-4 sm:p-5 rounded-xl border border-white/5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-semibold text-muted-foreground">
                                                            Salida Esperada
                                                        </p>
                                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 text-muted-foreground border border-white/10">Referencia</span>
                                                    </div>
                                                    <OutputTable text={q.expectedOutput.text} type="expected" />
                                                </div>

                                                <div className="flex flex-col mt-4 lg:mt-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-semibold text-foreground">
                                                            Tu Salida
                                                        </p>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${q.isCorrect ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                                            Obtenido
                                                        </span>
                                                    </div>
                                                    <OutputTable text={q.studentOutput.text} type="student" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ExamDetailStudent;
