import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

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

const Register = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("3");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const API_URL = import.meta.env.VITE_API_URL;

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ code, name, email, password, role: parseInt(role) }),
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Error registering user");
            }

            // Persist email/password for the verify step
            sessionStorage.setItem("pendingEmail", email);
            sessionStorage.setItem("pendingPassword", password);

            const data = await res.json();

            navigate("/verify", {
                state: {
                    email,
                    password,
                },
            });
        } catch (err) {
            setErrorMsg(err.message || "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Fondo animado */}
            <AnimatedBackground />

            {/* Card de registro */}
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
                            display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                        }}>
                            <Database className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    {/* Título */}
                    <h1 className="text-2xl font-bold text-foreground text-center mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-8">
                        Completa el formulario para unirte a QueryLogic
                    </p>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="h-1 w-16 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                        <div className="h-1 w-6 rounded-full bg-muted/30"></div>
                        <div className="h-1 w-6 rounded-full bg-muted/30"></div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Código Académico
                            </Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="200000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
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
                            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Nombre completo
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Juan Pérez"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@uninorte.edu.co"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            <Label htmlFor="role" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Tipo de cuenta
                            </Label>
                            <Select value={role} onValueChange={setRole} required>
                                <SelectTrigger 
                                    id="role"
                                    style={{
                                        background: 'rgba(17, 19, 31, 0.8)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '8px',
                                    }}
                                    className="focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                >
                                    <SelectValue placeholder="Selecciona tu rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3" >Estudiante</SelectItem>
                                    <SelectItem value="2" >Profesor</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">Podrás actualizar tu rol contactando al administrador</p>
                        </div>

                        {errorMsg && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                                <p className="text-xs text-destructive">{errorMsg}</p>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full mt-2" 
                            disabled={loading}
                            style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Registrando...
                                </span>
                            ) : "Registrarse"}
                        </Button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-primary hover:underline font-semibold"
                            >
                                Inicia sesión
                            </button>
                        </p>
                        <button
                            type="button"
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

export default Register;
