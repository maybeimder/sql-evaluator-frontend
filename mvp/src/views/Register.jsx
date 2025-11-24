import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
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

const Register = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
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
                body: JSON.stringify({ code, name, email, password }),
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
            console.log(data)

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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Database className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Completa el formulario para unirte a SQLEvaluator
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Codigo Académico</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="200000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Juan Pérez"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <div className="space-y-2">
                            <Label htmlFor="role">Tipo de cuenta</Label>
                            <Select value={role} onValueChange={setRole} required>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Selecciona tu rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Estudiante</SelectItem>
                                    <SelectItem value="teacher">Profesor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {errorMsg && (
                            <p className="text-sm text-red-500">
                                {errorMsg}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Registrando..." : "Registrarse"}
                        </Button>
                    </form>


                    <div className="mt-6 text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{" "}
                            <button
                                onClick={() => navigate("/login")}
                                className="text-primary hover:underline font-medium"
                            >
                                Inicia sesión
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

export default Register;
