import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ArrowLeft, Mail, Calendar, BookOpen, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * TeacherDetail - Vista detallada de un profesor
 * Muestra información completa, exámenes creados y estadísticas
 */
const TeacherDetail = () => {
  const navigate = useNavigate();

  // Datos de ejemplo del profesor
  const teacher = {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@email.com",
    joinDate: "01/09/2023",
    examsCreated: 8,
    totalStudents: 54,
  };

  // Exámenes creados por el profesor
  const examsCreated = [
    { id: 1, title: "SQL Básico - SELECT", students: 24, avgScore: 82, status: "Activo" },
    { id: 2, title: "JOIN y Relaciones", students: 18, avgScore: 75, status: "Activo" },
    { id: 3, title: "Funciones Agregadas", students: 12, avgScore: 88, status: "Cerrado" },
  ];

  const initials = teacher.name.split(" ").map(w => w[0]).slice(0, 2).join("");

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Cabecera de la aplicación */}
      <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                  <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">QueryLogic</span>
          </div>
          <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/admin")}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all duration-200 group"
          >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Volver al Panel</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-8 py-10 max-w-5xl">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            
            {/* Información principal del profesor (Hero Profile) */}
            <motion.div variants={itemVariants}>
                <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-10 shadow-xl shadow-black/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-500 group-hover:bg-primary/10"></div>
                    
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
                        {/* Header Info */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 text-center sm:text-left">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-3xl font-extrabold text-primary flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                {initials}
                            </div>
                            
                            {/* Detalles */}
                            <div className="flex flex-col justify-center h-full pt-1">
                                <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{teacher.name}</h1>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-muted-foreground">
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <Mail className="h-4 w-4 opacity-70" />
                                        <span className="text-sm font-medium">{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <Calendar className="h-4 w-4 opacity-70" />
                                        <span className="text-sm font-medium">Docente desde el {teacher.joinDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas en Mini Tarjetas */}
                        <div className="flex flex-row gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                            <div className="flex-1 lg:w-36 bg-black/20 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center hover:bg-black/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-3xl font-black text-foreground mb-1 leading-none">{teacher.examsCreated}</p>
                                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Exámenes</p>
                            </div>
                            <div className="flex-1 lg:w-36 bg-black/20 border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center hover:bg-black/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-3xl font-black text-foreground mb-1 leading-none">{teacher.totalStudents}</p>
                                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Estudiantes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Lista de exámenes creados */}
            <motion.div variants={itemVariants}>
                <Card className="bg-card/40 backdrop-blur-md border-white/5 shadow-xl shadow-black/10 overflow-hidden">
                    <CardHeader className="bg-black/20 border-b border-white/5 py-5 px-6 sm:px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Exámenes Creados</CardTitle>
                            <CardDescription className="mt-1">Historial de evaluaciones diseñadas por el docente</CardDescription>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5 hidden sm:inline-block">
                            {examsCreated.length} registrados
                        </span>
                    </CardHeader>
                    
                    <CardContent className="p-6 sm:p-8">
                        <div className="space-y-4">
                            {examsCreated.map((exam, idx) => {
                                const isActive = exam.status === "Activo";
                                return (
                                    <motion.div
                                        key={exam.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + (idx * 0.05) }}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-black/20 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        {/* Información del examen */}
                                        <div className="mb-4 sm:mb-0 ml-2">
                                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base">
                                                {exam.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Users className="h-3.5 w-3.5 opacity-70" />
                                                    <span className="font-medium">{exam.students} estudiantes</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <span className="font-medium text-primary/80">Promedio: {exam.avgScore}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Estado y Acción */}
                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 ml-2 sm:ml-0">
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
                                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? "bg-success" : "bg-muted-foreground"}`}></span>
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                                                        isActive
                                                        ? "bg-success/10 text-success border-success/20"
                                                        : "bg-muted/10 text-muted-foreground border-muted/20"
                                                    }`}
                                                >
                                                    {exam.status}
                                                </span>
                                            </div>
                                            
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all sm:group-hover:translate-x-1">
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDetail;
