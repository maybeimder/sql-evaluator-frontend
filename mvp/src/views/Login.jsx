import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Database, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

// Fondo animado con blobs
const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blob 1 — índigo */}
        <div style={{
            position: 'absolute', width: '700px', height: '700px',
            borderRadius: '50%', filter: 'blur(60px)', opacity: 0.55,
            background: 'radial-gradient(circle, #6366f1, transparent 70%)',
            top: '-200px', left: '-150px',
            animation: 'blob1 8s ease-in-out infinite',
        }} />
        {/* Blob 2 — violeta */}
        <div style={{
            position: 'absolute', width: '650px', height: '650px',
            borderRadius: '50%', filter: 'blur(60px)', opacity: 0.5,
            background: 'radial-gradient(circle, #a78bfa, transparent 70%)',
            bottom: '-150px', right: '-100px',
            animation: 'blob2 10s ease-in-out infinite',
        }} />
        {/* Blob 3 — cyan */}
        <div style={{
            position: 'absolute', width: '500px', height: '500px',
            borderRadius: '50%', filter: 'blur(50px)', opacity: 0.4,
            background: 'radial-gradient(circle, #38bdf8, transparent 70%)',
            top: '40%', left: '55%',
            animation: 'blob3 12s ease-in-out infinite',
        }} />
        {/* Blob 4 — rosa/magenta */}
        <div style={{
            position: 'absolute', width: '450px', height: '450px',
            borderRadius: '50%', filter: 'blur(55px)', opacity: 0.35,
            background: 'radial-gradient(circle, #e879f9, transparent 70%)',
            bottom: '15%', left: '5%',
            animation: 'blob4 9s ease-in-out infinite',
        }} />

        <style>{`
      @keyframes blob1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(80px, 60px) scale(1.15); }
        66% { transform: translate(-40px, 80px) scale(0.92); }
      }
      @keyframes blob2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-70px, -60px) scale(1.12); }
        66% { transform: translate(60px, -80px) scale(0.9); }
      }
      @keyframes blob3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-60px, 70px) scale(1.18); }
        66% { transform: translate(70px, -40px) scale(0.88); }
      }
      @keyframes blob4 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(80px, -70px) scale(1.15); }
      }
    `}</style>
    </div>
);

const Login = ({ noPermission = false }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [sessionExpired, setSessionExpired] = useState(() => {
        const expired = sessionStorage.getItem("session_expired") === "1";
        if (expired) sessionStorage.removeItem("session_expired");
        return expired;
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);
        try {
            const [res] = await Promise.all([
                fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ email, password }),
                }),
                new Promise((r) => setTimeout(r, 600)),
            ]);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Credenciales inválidas");
            if (!data.accessToken) throw new Error("No se recibió accessToken del servidor.");
            login(data.accessToken, data.user);
            const from = location.state?.from;
            const roles = data.user?.Roles ?? [];
            const dashboardByRole =
                roles.includes(1) ? "/dashboard/admin" :
                roles.includes(2) ? "/dashboard/teacher" :
                "/dashboard/student";
            navigate(from ?? dashboardByRole, { replace: true });
        } catch (err) {
            setErrorMsg(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

            {/* Fondo animado */}
            <AnimatedBackground />

            {/* Card de login */}
            <div className="relative z-10 w-full max-w-md">
                <div style={{
                    background: 'rgba(26, 29, 53, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '16px',
                    padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)',
                }}>

                    {/* Ícono */}
                    <div className="flex justify-center mb-6">
                        <div style={{
                            width: '52px', height: '52px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    {/* Título */}
                    <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                        Iniciar Sesión
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-8">
                        Ingresa tus credenciales para acceder a QueryLogic
                    </p>

                    {/* Alerta no permiso */}
                    {noPermission && (
                        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
                            <p className="text-xs text-warning">
                                No tuviste permisos para acceder al recurso anterior.
                                Ingresa con la cuenta adecuada para continuar.
                            </p>
                        </div>
                    )}

                    {/* Alerta sesión expirada */}
                    {sessionExpired && (
                        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
                            <p className="text-xs text-warning">
                                Tu sesión expiró. Por favor vuelve a iniciar sesión.
                            </p>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@uninorte.edu.co"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                                style={{
                                    background: 'rgba(17, 19, 31, 0.8)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '8px',
                                }}
                                className="focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Contraseña
                                </Label>
                                <button type="button" className="text-xs text-primary hover:underline cursor-pointer">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                                style={{
                                    background: 'rgba(17, 19, 31, 0.8)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '8px',
                                }}
                                className="focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>

                        {errorMsg && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                                <p className="text-xs text-destructive">{errorMsg}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-2 flex items-center justify-center gap-2"
                            disabled={loading}
                            style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            )}
                            {loading ? "Ingresando..." : "Ingresar"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">O continúa con</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Botón Roble */}
                    <button
                        onClick={() => navigate("/dashboard/student")}
                        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Iniciar sesión con Roble
                    </button>

                    {/* SOLO PARA PRUEBAS VISUALES - quitar después */}
                    <div className="mt-5 pt-5 border-t border-border/40 rounded-xl">
                        <p className="text-[10px] font-bold text-muted-foreground/60 text-center mb-3 uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block"></span>
                            Modo previsualización
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block"></span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => navigate("/preview/teacher")}
                                className="flex-1 py-2.5 sm:py-2 text-xs rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/40 transition-all duration-200 font-medium cursor-pointer min-h-11 sm:min-h-0"
                            >
                                Ver Dashboard Profesor
                            </button>
                            <button
                                onClick={() => navigate("/preview/student")}
                                className="flex-1 py-2.5 sm:py-2 text-xs rounded-lg border border-success/20 bg-success/5 text-success hover:bg-success/15 hover:border-success/40 transition-all duration-200 font-medium cursor-pointer min-h-11 sm:min-h-0"
                            >
                                Ver Dashboard Estudiante
                            </button>
                            <button
                                onClick={() => navigate("/preview/admin")}
                                className="flex-1 py-2.5 sm:py-2 text-xs rounded-lg border border-accent/20 bg-accent/5 text-accent hover:bg-accent/15 hover:border-accent/40 transition-all duration-200 font-medium cursor-pointer min-h-11 sm:min-h-0"
                            >
                                Ver Dashboard Admin
                            </button>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            ¿No tienes cuenta?{" "}
                            <button
                                onClick={() => navigate("/register")}
                                className="text-primary hover:underline font-semibold"
                            >
                                Regístrate aquí
                            </button>
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
