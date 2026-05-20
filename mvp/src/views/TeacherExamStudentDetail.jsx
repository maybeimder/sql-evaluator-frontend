import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, ArrowLeft, CheckCircle2, XCircle, Clock, Code2, Terminal, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL;

const CodeBlock = ({ code, title, icon: Icon }) => (
  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-sm flex flex-col">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
      </div>
    </div>
    <div className="p-4 overflow-x-auto flex-1">
      {code ? (
        <pre className="text-sm font-mono text-foreground/90"><code>{code.trim()}</code></pre>
      ) : (
        <p className="text-xs text-muted-foreground italic">Sin respuesta registrada.</p>
      )}
    </div>
  </div>
);

const RowCountBadge = ({ label, count, variant = "default" }) => {
  const isRef = variant === "ref";
  const displayCount = count !== null && typeof count === "object"
    ? (count.rowCount ?? count.rows?.length ?? null)
    : count;

  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border p-5 gap-1 ${isRef ? "bg-muted/10 border-white/5" : "bg-card/40 border-white/10"}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      {displayCount !== null && displayCount !== undefined ? (
        <span className="text-3xl font-black text-foreground">{displayCount}<span className="text-sm font-semibold text-muted-foreground ml-1">filas</span></span>
      ) : (
        <span className="text-sm text-muted-foreground italic">—</span>
      )}
    </div>
  );
};

const isPseudoOutput = (v) =>
  v && typeof v === "object" && !Array.isArray(v) && "outputs" in v;

const ChipList = ({ items, colorClass }) => {
  if (!items?.length) return <span className="text-sm text-muted-foreground italic">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((val, i) => (
        <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${colorClass}`}>
          {val}
        </span>
      ))}
    </div>
  );
};

const getStatusBadge = (status) => {
  if (status === "Aprobado") return <span className="text-success font-semibold bg-success/10 px-2 py-0.5 rounded border border-success/20">{status}</span>;
  if (status === "Reprobado") return <span className="text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">{status}</span>;
  return <span className="text-warning font-semibold bg-warning/10 px-2 py-0.5 rounded border border-warning/20">{status ?? "Pendiente"}</span>;
};

const TeacherExamStudentDetail = () => {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/exams/id/${examId}/results/${studentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.message || `Error ${res.status}`);
        setResult(data.result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [examId, studentId, accessToken]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground animate-pulse">Cargando resultados...</p>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-sm text-destructive">{error ?? "No se encontró información del intento."}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    </div>
  );

  const percentage = result.percentage ?? result.score ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">QueryLogic</span>
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2 active:scale-95 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

          {/* Exam + student info */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden relative group shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
              <CardContent className="p-6 sm:p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                      <BookOpen className="h-7 w-7 text-primary/80" />
                      {result.exam.title}
                    </h1>
                    <p className="text-muted-foreground text-sm pl-10 mb-6">{result.exam.description}</p>

                    <div className="pl-10 space-y-3">
                      <div className="flex items-center gap-3 bg-white/2 p-3 rounded-lg border border-white/5 w-fit">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{result.student.name}</p>
                          <p className="text-xs text-muted-foreground">{result.student.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          Estado: {getStatusBadge(result.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score circle */}
                  <div className="flex flex-col items-center md:items-end bg-black/20 p-5 rounded-2xl border border-primary/15 shadow-[0_0_25px_rgba(99,102,241,0.08)] min-w-[200px] justify-center">
                    <div className="relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary transition-all duration-1000 ease-out"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{percentage}%</span>
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
            {result.questions.map((q, idx) => (
              <motion.div variants={itemVariants} key={q.id}>
                <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader className="border-b border-white/5 bg-white/1 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                            {idx + 1}
                          </span>
                          <CardTitle className="text-lg sm:text-xl text-foreground">{q.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm text-foreground/70 sm:pl-11">{q.description}</CardDescription>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2">
                        {q.correct === true ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="h-4 w-4" /> Correcto
                          </div>
                        ) : q.correct === false ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider">
                            <XCircle className="h-4 w-4" /> Incorrecto
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/20 border border-white/10 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                            <Clock className="h-4 w-4" /> Sin respuesta
                          </div>
                        )}
                        <p className="text-xs font-medium text-muted-foreground bg-black/20 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1">
                          <span className={`font-bold ${q.correct === true ? "text-success" : q.correct === false ? "text-destructive" : "text-muted-foreground"}`}>{q.points}</span>
                          <span>/ {q.maxPoints} pts</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 sm:p-6 space-y-8">
                    {/* Student query */}
                    <div className="w-full">
                      <CodeBlock code={q.studentQuery} title="Consulta del estudiante" icon={Code2} />
                    </div>

                    {/* Output comparison */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Comparación de Resultados</h4>
                      </div>

                      {isPseudoOutput(q.expectedOutput) ? (
                        /* ── Pseudocódigo ─────────────────────────────── */
                        <div className="space-y-4 bg-black/25 p-4 sm:p-5 rounded-xl border border-white/5">
                          {/* Entradas */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/80 mb-2">Entradas</p>
                            <ChipList items={q.expectedOutput.inputs} colorClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-300" />
                          </div>
                          <div className="border-t border-white/5" />
                          {/* Salida esperada vs obtenida */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-muted-foreground">Salida Esperada</p>
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 text-muted-foreground border border-white/10">Referencia</span>
                              </div>
                              <ChipList items={q.expectedOutput.outputs} colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-300" />
                            </div>
                            <div className="mt-4 lg:mt-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-foreground">Salida del Estudiante</p>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${q.correct === true ? "bg-success/10 text-success border-success/20" : q.correct === false ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                                  {q.correct === null ? "Pendiente" : "Obtenido"}
                                </span>
                              </div>
                              <ChipList
                                items={Array.isArray(q.studentOutput) ? q.studentOutput : (q.studentOutput?.outputs ?? null)}
                                colorClass={q.correct === true ? "bg-success/10 border-success/20 text-success" : "bg-destructive/10 border-destructive/20 text-destructive"}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* ── SQL ──────────────────────────────────────── */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 bg-black/25 p-4 sm:p-5 rounded-xl border border-white/5">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-muted-foreground">Salida Esperada</p>
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 text-muted-foreground border border-white/10">Referencia</span>
                            </div>
                            <RowCountBadge label="Filas esperadas" count={q.expectedOutput} variant="ref" />
                          </div>
                          <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-foreground">Salida del Estudiante</p>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${q.correct === true ? "bg-success/10 text-success border-success/20" : q.correct === false ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                                {q.correct === null ? "Pendiente" : "Obtenido"}
                              </span>
                            </div>
                            <RowCountBadge label="Filas obtenidas" count={q.studentOutput} variant="student" />
                          </div>
                        </div>
                      )}
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
