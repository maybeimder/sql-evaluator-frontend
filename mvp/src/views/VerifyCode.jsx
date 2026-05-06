import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:3000

const VerifyCode = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Prefer state (from navigate), fallback to sessionStorage
    const emailFromState = location.state?.email;
    const passwordFromState = location.state?.password;

    const [email] = useState(
        emailFromState || sessionStorage.getItem("pendingEmail") || ""
    );
    const [password] = useState(
        passwordFromState || sessionStorage.getItem("pendingPassword") || ""
    );

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const code = otp.join("");

    useEffect(() => {
        // If we don't have email or password, send back to register
        if (!email || !password) {
            navigate("/register");
        }
    }, [email, password, navigate]);

    // Focus on first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChangeOtp = (element, index) => {
        const val = element.value.replace(/\D/g, "");
        if (val === "") {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);

        // Focus next input
        if (val && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
            if (inputRefs.current[nextFocusIndex]) {
                inputRefs.current[nextFocusIndex].focus();
            }
        }
    };

    const handleResendCode = () => {
        setIsResending(true);
        setErrorMsg("");
        // Simulación UI de reenvío
        setTimeout(() => {
            setIsResending(false);
            // Optionally set a success toast here if you have a toast system
        }, 1500);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email || !password || code.length !== 6) return;

        setErrorMsg("");
        setLoading(true);

        try {
            // 1️⃣ Verify code with backend
            const verifyRes = await fetch(`${API_URL}/auth/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    code,
                }),
            });

            if (!verifyRes.ok) {
                const data = await verifyRes.json().catch(() => ({}));
                throw new Error(data.message || "Invalid or expired code");
            }

            // 2️⃣ Automatic login with verified credentials
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                credentials: "include",
            });

            if (!loginRes.ok) {
                const data = await loginRes.json().catch(() => ({}));
                throw new Error(data.message || "Error during automatic login");
            }

            const loginData = await loginRes.json().catch(() => ({}));

            // Mostrar estado de éxito brevemente antes de redirigir
            setIsSuccess(true);
            setLoading(false);

            setTimeout(() => {
                if (loginData.accessToken) {
                    login(loginData.accessToken, loginData.user);
                }

                // Limpiar credenciales temporales
                sessionStorage.removeItem("pendingEmail");
                sessionStorage.removeItem("pendingPassword");

                const roles = loginData.user?.Roles || [];

                if (roles.includes(3)) navigate("/dashboard/student");
                else if (roles.includes(2)) navigate("/dashboard/teacher");
                else if (roles.includes(1)) navigate("/dashboard/admin");
                else navigate("/dashboard/student");
            }, 800);

        } catch (err) {
            setErrorMsg(err.message || "Error verifying code");
            setLoading(false);
        }
    };

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-md relative z-10">
                <Card className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
                    <CardHeader className="text-center pb-6">
                        <motion.div variants={itemVariants} className="flex justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150"></div>
                            <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4 rounded-2xl relative z-10">
                                {isSuccess ? (
                                    <CheckCircle2 className="h-8 w-8 text-success" />
                                ) : (
                                    <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-3 inline-block">
                                Paso 2 de 2 — Verificación
                            </span>
                            <CardTitle className="text-2xl font-extrabold tracking-tight mt-2 mb-2">Protege tu cuenta</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                                Ingresa el código de 6 dígitos que enviamos a<br />
                                <span className="font-semibold text-foreground bg-white/5 px-2 py-0.5 rounded-md mt-1 inline-block border border-white/10">{email}</span>
                            </CardDescription>
                        </motion.div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-6">

                            <motion.div variants={itemVariants} className="flex justify-center gap-2 sm:gap-3 py-2">
                                {otp.map((data, index) => {
                                    return (
                                        <input
                                            key={index}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="1"
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            value={data}
                                            onChange={(e) => handleChangeOtp(e.target, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            disabled={loading || isSuccess}
                                            className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-black/40 border border-white/10 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/50 focus:bg-primary/5 transition-all outline-none"
                                        />
                                    );
                                })}
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <p className="font-medium">{errorMsg}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {isSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-success/10 border border-success/20 text-success text-sm p-3 rounded-lg flex items-center justify-center gap-2 font-bold"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Código verificado correctamente
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants}>
                                <Button
                                    type="submit"
                                    className={`w-full h-11 text-sm font-bold transition-all duration-300 ${isSuccess ? 'bg-success hover:bg-success text-black' : 'shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:scale-95'}`}
                                    disabled={loading || code.length !== 6 || isSuccess}
                                >
                                    {loading ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verificando código...</>
                                    ) : isSuccess ? (
                                        "Ingresando al sistema..."
                                    ) : (
                                        "Confirmar y Continuar"
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        <motion.div variants={itemVariants} className="mt-8 space-y-5">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-2">¿No recibiste el código? Revisa tu bandeja de spam.</p>
                                <button
                                    onClick={handleResendCode}
                                    disabled={isResending || loading || isSuccess}
                                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <RefreshCcw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                                    {isResending ? "Enviando..." : "Reenviar código"}
                                </button>
                            </div>

                            <div className="border-t border-white/5 pt-5 text-center flex flex-col gap-3">
                                <button
                                    onClick={() => navigate("/login")}
                                    disabled={loading || isSuccess}
                                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ¿Ya tienes tu cuenta verificada? <span className="text-primary">Inicia sesión</span>
                                </button>
                                <button
                                    onClick={() => navigate("/register")}
                                    disabled={loading || isSuccess}
                                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Volver a crear cuenta
                                </button>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default VerifyCode;
