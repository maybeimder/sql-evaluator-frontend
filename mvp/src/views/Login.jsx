import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Adaptación: remover el tipo TypeScript
  const handleLogin = (e) => {
    e.preventDefault();

    // Aquí luego conectas con tu backend real
    navigate("/dashboard/student");
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

          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>

          <CardDescription>
            Ingresa tus credenciales para acceder a SQLEvaluator
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email */}
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

            {/* Password */}
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

            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </form>

          {/* Links debajo */}
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