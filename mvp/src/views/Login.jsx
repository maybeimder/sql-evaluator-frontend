import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL; // http://localhost:3000

// Accept optional prop: noPermission
const Login = ({ noPermission = false }) => {

    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json().catch(() => ({}));
            console.log("[Login] backend response:", data);

            if (!res.ok) {
                throw new Error(data.message || "Credenciales inválidas");
            }

            if (!data.accessToken) {
                throw new Error("No se recibió accessToken del servidor.");
            }

            // Save token + user in context
            login(data.accessToken, data.user);

            const role = data.user?.Roles || null;

            if (role.includes(3)) navigate("/dashboard/student");
            else if (role.includes(2)) navigate("/dashboard/teacher");
            else if (role.includes(1)) navigate("/dashboard/admin");
            else navigate("/dashboard/student");
        } catch (err) {
            console.error("[Login] error:", err);
            setErrorMsg(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Database className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    {noPermission && (
                        <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left">
                            <p className="text-xs text-amber-700">
                                No tuviste permisos para acceder al recurso anterior.
                                Ingresa con la cuenta adecuada para continuar.
                            </p>
                        </div>
                    )}

                    <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para acceder a SQLEvaluator
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {errorMsg && (
                            <p className="text-red-500 text-sm">{errorMsg}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Ingresando..." : "Ingresar"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            ¿No tienes cuenta?{" "}
                            <button
                                onClick={() => navigate("/register")}
                                className="text-primary hover:underline font-medium"
                            >
                                Regístrate aquí
                            </button>
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            ← Volver al inicio
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
