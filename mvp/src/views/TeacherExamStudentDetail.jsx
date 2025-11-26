import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, ArrowLeft, CheckCircle2, XCircle, Code2 } from "lucide-react";

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
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Helper: parsea un string tipo salida de SQL en filas/columnas
// Ejemplo:
// cliente_id | total
// 1          | 300
// 2          | 150
// ---------------------------------------------------------------------------
const parseTableText = (text) => {
  if (!text || typeof text !== "string") return { headers: [], rows: [] };

  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const rows = lines.map((line) =>
    line
      .trim()
      // separa por "|" con o sin espacios o por bloques de 2+ espacios
      .split(/\s*\|\s*|\s{2,}/)
      .filter((cell) => cell !== "")
  );

  const headers = rows[0];
  const data = rows.slice(1);

  return { headers, rows: data };
};

// ---------------------------------------------------------------------------
// Componente que usa TU Table (table.jsx) para renderizar la salida formateada
// ---------------------------------------------------------------------------
const SqlOutputTable = ({ text, muted = false }) => {
  const { headers, rows } = parseTableText(text);

  if (!headers.length && !rows.length) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-lg border ${
        muted ? "bg-muted/80" : "bg-background"
      }`}
    >
      <Table className="w-full text-sm font-mono">
        <TableHeader>
          <TableRow>
            {headers.map((h, i) => (
              <TableHead key={i} className="font-semibold">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rIdx) => (
            <TableRow key={rIdx}>
              {row.map((cell, cIdx) => (
                <TableCell key={cIdx}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MOCK de intento de examen — luego lo reemplazas con un fetch a tu API
// mockStudentExamAttempts[examId][studentId]
// ---------------------------------------------------------------------------
const mockStudentExamAttempts = {
  "1": {
    "1": {
      student: {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@uninorte.edu.co",
      },
      exam: {
        id: 1,
        title: "SQL Básico - SELECT",
        description: "Primer examen sobre consultas SELECT.",
      },
      score: 88,
      status: "Completado",
      questions: [
        {
          id: 1,
          title: "Total de ventas por cliente",
          description: "Obtén el total de ventas por cliente usando SUM().",
          expectedOutput: `
cliente_id  total
1           300
2           150
          `,
          studentQuery:
            "SELECT cliente_id, SUM(monto) AS total FROM ventas GROUP BY cliente_id;",
          studentOutput: `
cliente_id  total
1           300
2           150
          `,
          correct: true,
          points: 20,
          maxPoints: 20,
        },
        {
          id: 2,
          title: "Cantidad de pedidos por cliente",
          description: "Cuenta cuántos pedidos tiene cada cliente.",
          expectedOutput: `
cliente_id  total_pedidos
1           5
2           3
          `,
          studentQuery:
            "SELECT cliente_id, COUNT(*) AS total_pedidos FROM pedidos GROUP BY cliente_id;",
          studentOutput: `
cliente_id  total_pedidos
1           5
2           2
          `,
          correct: false,
          points: 10,
          maxPoints: 20,
        },
      ],
    },
  },
};

const TeacherExamStudentDetail = () => {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();

  const data =
    mockStudentExamAttempts[examId] &&
    mockStudentExamAttempts[examId][studentId];

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            No se encontró información del intento de este estudiante.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Volver
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
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al examen
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Exam + student info */}
        <Card>
          <CardHeader>
            <CardTitle>{data.exam.title}</CardTitle>
            <CardDescription>{data.exam.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Estudiante:</strong> {data.student.name} —{" "}
              {data.student.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Estado:</strong>{" "}
              {data.status === "Completado" ? (
                <span className="text-success">Completado</span>
              ) : (
                <span className="text-warning">Pendiente</span>
              )}
            </p>
            <p className="text-sm">
              <strong>Calificación final:</strong>{" "}
              <span className="text-primary font-semibold">
                {data.score}%
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {data.questions.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row justify-between items-center gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Pregunta {idx + 1}: {q.title}
                  </CardTitle>
                  <CardDescription>{q.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {q.correct ? (
                    <div className="flex items-center gap-1 text-success text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Respuesta correcta
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-destructive text-sm font-medium">
                      <XCircle className="h-4 w-4" />
                      Respuesta incorrecta
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {q.points} / {q.maxPoints} puntos
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Consulta del estudiante */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Consulta del estudiante
                  </p>
                  <pre className="bg-card border border-border rounded-md p-3 text-sm font-mono overflow-x-auto">
                    {q.studentQuery}
                  </pre>
                </div>

                {/* Salida esperada vs salida del estudiante */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Salida esperada
                    </p>
                    <SqlOutputTable text={q.expectedOutput} muted />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Tu salida
                    </p>
                    <SqlOutputTable text={q.studentOutput} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherExamStudentDetail;
