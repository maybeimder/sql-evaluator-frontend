import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function Unauthorized() {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    const floatingAnimation = {
        y: ["-8px", "8px"],
        transition: {
            y: { duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="text-center relative z-10 px-6 max-w-lg mx-auto"
            >
                <motion.div variants={itemVariants} className="flex justify-center mb-8">
                    <motion.div animate={floatingAnimation} className="relative">
                        <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full scale-150"></div>
                        <div className="w-24 h-24 bg-card border border-white/10 shadow-2xl shadow-destructive/10 rounded-3xl flex items-center justify-center relative z-10 backdrop-blur-md">
                            <ShieldOff className="h-12 w-12 text-destructive/80" strokeWidth={1.5} />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2 mb-8">
                    <span className="text-xs font-bold text-destructive tracking-widest uppercase bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20 mb-4 inline-block">
                        Acceso Denegado — Error 403
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black text-foreground tracking-tighter drop-shadow-md mt-4">
                        Sin Permiso
                    </h1>
                    <p className="text-base sm:text-lg font-medium text-muted-foreground/80 max-w-md mx-auto leading-relaxed mt-3">
                        No tienes los permisos necesarios para acceder a esta sección.
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-mono mt-4 bg-black/20 py-2 px-4 rounded-lg inline-block border border-white/5">
                        Contacta al administrador si crees que esto es un error.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => navigate("/")}
                        size="lg"
                        className="w-full sm:w-auto gap-2 text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-95 px-8 cursor-pointer"
                    >
                        <Home className="h-4 w-4" />
                        Volver al inicio
                    </Button>

                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto gap-2 text-sm font-bold border-white/10 hover:bg-white/5 transition-all duration-300 active:scale-95 px-8 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        Volver atrás
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}
