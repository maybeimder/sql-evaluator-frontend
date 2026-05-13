import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, ArrowLeft, CheckCircle2, XCircle, Code2, Terminal, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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
const SqlOutputTable = ({ text, type = "student" }) => {
  const { headers, rows } = parseTableText(text);

  if (!headers.length && !rows.length) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-white/10 bg-white/[0.01] text-xs text-muted-foreground italic">
        Sin datos para mostrar
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
              <TableHead key={i} className={`h-10 px-4 text-xs font-semibold ${isExpected ? "text-muted-foreground" : "text-foreground/80"}`}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rIdx) => (
            <TableRow key={rIdx} className={`border-b border-white/5 last:border-0 transition-colors duration-200 group ${highlightClass}`}>
              {row.map((cell, cIdx) => (
                <TableCell key={cIdx} className={`px-4 py-2 text-xs ${isExpected ? "text-muted-foreground" : "text-foreground"}`}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const CodeBlock = ({ code, title, icon: Icon }) => (
    <div className={`rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-sm h-full flex flex-col`}>
        <div className={`flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]`}>
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 text-muted-foreground`} />
                <span className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground`}>{title}</span>
            </div>
            <div className="flex gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full bg-white/10`}></div>
                <div className={`w-2.5 h-2.5 rounded-full bg-white/10`}></div>
                <div className={`w-2.5 h-2.5 rounded-full bg-white/10`}></div>
            </div>
        </div>
        <div className="p-4 overflow-x-auto flex-1">
            <pre className={`text-sm font-mono text-foreground/90`}>
                <code>{code?.trim()}</code>
            </pre>
        </div>
    </div>
);

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
  // Borrar despues
  const { examId, studentId } = useParams();

  const previewExamId = examId || "1";
  const previewStudentId = studentId || "1";

  const data =
    mockStudentExamAttempts[previewExamId] &&
    mockStudentExamAttempts[previewExamId][previewStudentId];
  // borrar hasta aqui


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

  const navigate = useNavigate();

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
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2 active:scale-95 transition-all duration-200 group"
              >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline">Volver</span>
              </Button>
          </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
          {/* Exam + student info */}
          <motion.div variants={itemVariants}>
              <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors duration-500 group-hover:bg-primary/10"></div>
                  
                  <CardContent className="p-6 sm:p-8 relative z-10">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex-1">
                              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                                <BookOpen className="h-7 w-7 text-primary/80" /> 
                                {data.exam.title}
                              </h1>
                              <p className="text-muted-foreground text-sm pl-10 mb-6">{data.exam.description}</p>
                              
                              <div className="pl-10 space-y-3">
                                <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5 w-fit">
                                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{data.student.name}</p>
                                    <p className="text-xs text-muted-foreground">{data.student.email}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                                  <span className="flex items-center gap-2 text-muted-foreground">
                                    Estado: 
                                    {data.status === "Completado" ? (
                                      <span className="text-success font-semibold bg-success/10 px-2 py-0.5 rounded border border-success/20">Completado</span>
                                    ) : (
                                      <span className="text-warning font-semibold bg-warning/10 px-2 py-0.5 rounded border border-warning/20">Pendiente</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                          </div>
                          
                          <div className="flex flex-col items-center md:items-end bg-black/20 p-5 rounded-2xl border border-primary/15 shadow-[0_0_25px_rgba(99,102,241,0.08)] min-w-[200px] justify-center">
                              <div className="relative">
                                  <svg className="w-24 h-24 transform -rotate-90">
                                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary transition-all duration-1000 ease-out" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * data.score) / 100} strokeLinecap="round" />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-2xl font-bold text-primary">{data.score}%</span>
                                  </div>
                              </div>
                              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-4">Calificación Final</span>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </motion.div>

          {/* Questions */}
          <div className="space-y-6">
            {data.questions.map((q, idx) => (
              <motion.div variants={itemVariants} key={q.id}>
                <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader className="border-b border-white/5 bg-white/[0.01] p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                                {idx + 1}
                            </span>
                            <CardTitle className="text-lg sm:text-xl text-foreground">
                                {q.title}
                            </CardTitle>
                        </div>
                        <CardDescription className="text-sm text-foreground/70 sm:pl-11">
                          {q.description}
                        </CardDescription>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2">
                        {q.correct ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                <CheckCircle2 className="h-4 w-4" /> Correcto
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(248,113,113,0.1)]">
                                <XCircle className="h-4 w-4" /> Incorrecto
                            </div>
                        )}
                        <p className="text-xs font-medium text-muted-foreground bg-black/20 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1">
                            <span className={`font-bold ${q.correct ? "text-success" : "text-destructive"}`}>{q.points}</span>
                            <span>/ {q.maxPoints} pts</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 space-y-8">
                    {/* Consulta del estudiante */}
                    <div className="w-full">
                        <CodeBlock 
                            code={q.studentQuery} 
                            title="Consulta del estudiante" 
                            icon={Code2} 
                        />
                    </div>

                    {/* Salida esperada vs salida obtenida */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Comparación de Resultados</h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 bg-black/25 p-4 sm:p-5 rounded-xl border border-white/5">
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        Salida Esperada
                                    </p>
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 text-muted-foreground border border-white/10">Referencia</span>
                                </div>
                                <SqlOutputTable text={q.expectedOutput} type="expected" />
                            </div>

                            <div className="flex flex-col mt-4 lg:mt-0">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-foreground">
                                        Salida del Estudiante
                                    </p>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${q.correct ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                        Obtenido
                                    </span>
                                </div>
                                <SqlOutputTable text={q.studentOutput} type="student" />
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

export default TeacherExamStudentDetail;
