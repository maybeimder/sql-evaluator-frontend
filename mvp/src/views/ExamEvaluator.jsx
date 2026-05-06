import { Button } from "@/components/ui/button";
import { Database, Play, CheckCircle2, LogOut, Code2, Terminal, ChevronLeft, ChevronRight, FileText, Database as DbIcon, Info, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const ExamEvaluator = () => {
  const navigate = useNavigate();
  const [sqlCode, setSqlCode] = useState("SELECT * FROM usuarios WHERE edad > 18;");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60 * 60);
  const [executionTime, setExecutionTime] = useState(null);
  const timerRef = useRef(null);

  const mockQuestion = {
    title: "Consulta de Usuarios Mayores de Edad",
    description: "Escribe una consulta SQL que devuelva todos los usuarios mayores de 18 años. La tabla se llama 'usuarios' y tiene las columnas: id, nombre, email, edad.",
    expectedOutput: "3 registros encontrados",
    points: 10,
    type: "SQL"
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleRunQuery = () => {
    setIsExecuting(true);
    const start = performance.now();
    setTimeout(() => {
        setOutput("✓ Consulta ejecutada correctamente\n\n3 registros encontrados:\n\nid | nombre        | email              | edad\n1  | Ana García    | ana@email.com      | 24\n2  | Luis Pérez    | luis@email.com     | 31\n5  | María López   | maria@email.com    | 22");
        setIsExecuting(false);
        const end = performance.now();
        const elapsed = end - start;
        setExecutionTime(elapsed < 1000 ? `${elapsed.toFixed(0)}ms` : `${(elapsed / 1000).toFixed(2)}s`);
    }, 400);
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0d0f1a] overflow-hidden font-sans text-foreground">
      
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
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n === 1 ? 'w-6 bg-primary shadow-[0_0_6px_rgba(99,102,241,0.6)]' : 'w-4 bg-white/10'}`}></div>
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">1/5</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${remainingTime <= 300 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
              <Clock className="h-3 w-3" />
              {formatTime(remainingTime)}
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard/student")}
                className="text-muted-foreground hover:text-white hover:bg-white/5 transition-colors h-8 text-xs"
            >
              <LogOut className="h-3.5 w-3.5 sm:mr-2" />
              <span className="hidden sm:inline">Salir sin guardar</span>
            </Button>
            <Button 
                size="sm" 
                onClick={() => navigate("/dashboard/student")}
                className="h-8 text-xs gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Enviar Examen</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex flex-col md:flex-row min-h-0 relative"
      >
        
        {/* Panel Izquierdo (Pregunta) */}
        <motion.div variants={itemVariants} className="w-full md:w-[35%] lg:w-[30%] flex flex-col border-r border-white/10 bg-[#111320]/80 backdrop-blur-md z-10">
            {/* Header Pregunta */}
            <div className="p-4 sm:p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_8px_rgba(99,102,241,0.15)]">
                        Pregunta 1 de 5
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        {mockQuestion.points} <span className="text-muted-foreground font-normal">pts</span>
                    </span>
                </div>
                <h2 className="text-lg font-bold text-foreground leading-tight mb-2">
                    {mockQuestion.title}
                </h2>
                <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                        {mockQuestion.type}
                    </span>
                </div>
            </div>

            {/* Contenido Pregunta (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar">
                
                <div className="text-sm text-foreground/90 leading-relaxed">
                    <p>{mockQuestion.description}</p>
                </div>

                {/* Esquema de Tabla (Solo si es SQL) */}
                {mockQuestion.type === "SQL" && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <DbIcon className="h-3.5 w-3.5 text-primary/60" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Esquema de la Tabla</h4>
                        </div>
                        <div className="bg-[#090a10] border border-white/5 rounded-xl p-3 relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-primary/50 transition-colors"></div>
                            <pre className="text-[13px] text-muted-foreground font-mono leading-relaxed pl-2 overflow-x-auto">
{`usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100),
  edad INT
)`}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Salida Esperada */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Info className="h-3.5 w-3.5 text-success/60" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-success/60">Salida Esperada</h4>
                    </div>
                    <div className="bg-[#090a10] border border-white/5 rounded-xl p-3 relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-green-500/50 transition-colors"></div>
                        <code className="text-[13px] text-green-400/90 font-mono pl-2 block break-all">
                            {mockQuestion.expectedOutput}
                        </code>
                    </div>
                </div>

            </div>

            {/* Navegación Footer */}
            <div className="p-4 border-t border-white/5 flex gap-3 bg-black/20">
                <Button variant="outline" className="flex-1 h-9 text-xs gap-1 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Anterior
                </Button>
                <Button className="flex-1 h-9 text-xs gap-1 border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary transition-all shadow-none">
                    Siguiente
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
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
                    className="absolute inset-0 pl-14 pr-4 py-4 w-full h-full font-mono text-[14px] bg-transparent text-[#e2e8f0] border-none resize-none focus-visible:ring-0 leading-relaxed"
                    placeholder="Escribe tu código aquí..."
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
                {executionTime !== null && (
                    <span className="text-[10px] font-mono text-muted-foreground/70 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {executionTime}
                    </span>
                )}
            </div>
            
            {/* Console Output Area */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar relative">
                <AnimatePresence mode="wait">
                    {output ? (
                        <motion.div
                            key="output"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-mono text-[13px]"
                        >
                            <pre className="text-[#a78bfa] whitespace-pre-wrap leading-relaxed">
                                {output}
                            </pre>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50"
                        >
                            <Terminal className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-xs font-medium">Esperando ejecución...</p>
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
