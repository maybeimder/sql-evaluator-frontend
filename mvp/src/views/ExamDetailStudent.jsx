// src/views/ExamDetailStudent.jsx
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Database, Code2 } from "lucide-react";

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


const OutputTable = ({ text, muted }) => {
    const { headers, rows } = parseOutput(text);

    if (!headers.length) {
        return (
            <div className="text-xs text-muted-foreground italic">
                (Salida vacía)
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg border overflow-x-auto ${muted ? "bg-muted/70" : "bg-background"
                }`}
        >
            <Table className="text-sm font-mono">
                <TableHeader>
                    <TableRow>
                        {headers.map((h, i) => (
                            <TableHead key={i}>{h}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r, i) => (
                        <TableRow key={i}>
                            {r.map((cell, j) => (
                                <TableCell key={j}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

// ---------------------------------------------------------------------------
// MOCK de datos (luego lo reemplazas con fetch)
// ---------------------------------------------------------------------------
const mockExamDetails = {
    "3": {
        id: 3,
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                            SQLEvaluator
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/student")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al panel
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
                {/* Resumen del examen */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            {exam.title}
                            <span className="text-2xl font-bold text-success">
                                {exam.score}%
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Profesor: {exam.professor} • Completado el {exam.date}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            La evaluación compara la{" "}
                            <strong>salida esperada</strong> con tu{" "}
                            <strong>salida generada</strong>.
                            La consulta SQL es solo una referencia, no la única solución válida.
                        </p>
                    </CardContent>
                </Card>

                {/* Preguntas */}
                {exam.questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-lg">
                                    Pregunta {index + 1}:{" "}
                                    <span className="font-normal text-muted-foreground">
                                        {q.questionTitle}
                                    </span>
                                </CardTitle>
                                <CardDescription>{q.questionText}</CardDescription>
                            </div>

                            <div className="text-right">
                                <p className="text-sm">
                                    <strong>{q.awardedScore}</strong> / {q.maxScore}
                                </p>
                                {q.isCorrect ? (
                                    <span className="text-success text-sm flex items-center gap-1 justify-end">
                                        <CheckCircle2 className="h-4 w-4" /> Correcto
                                    </span>
                                ) : (
                                    <span className="text-destructive text-sm flex items-center gap-1 justify-end">
                                        <XCircle className="h-4 w-4" /> Incorrecto
                                    </span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Consulta del estudiante */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                                    <Code2 className="h-4 w-4" /> Tu consulta SQL
                                </p>
                                <pre className="bg-card border rounded-md p-3 font-mono text-sm overflow-x-auto">
                                    {q.studentQuery}
                                </pre>
                            </div>

                            {/* Salida esperada vs salida obtenida */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                                        Salida esperada
                                    </p>
                                    <OutputTable text={q.expectedOutput.text} muted />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                                        Tu salida
                                    </p>
                                    <OutputTable text={q.studentOutput.text} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ExamDetailStudent;
