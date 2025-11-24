import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:3000

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer state (from navigate), fallback to sessionStorage
  const emailFromState = location.state?.email;
  const passwordFromState = location.state?.password;

  const [email] = useState(
    emailFromState || sessionStorage.getItem("pendingEmail") || ""
  );
  const [password] = useState(
    passwordFromState || sessionStorage.getItem("pendingPassword") || ""
  );

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If we don't have email or password, send back to register
    if (!email || !password) {
      navigate("/register");
    }
  }, [email, password, navigate]);

  const handleChangeCode = (e) => {
    // Allow only digits and max 6 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

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
        credentials: "include", // important to receive HttpOnly refreshToken cookie
      });

      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        throw new Error(data.message || "Error during automatic login");
      }

      const loginData = await loginRes.json().catch(() => ({}));

      // Store accessToken in front storage (or your auth store)
      if (loginData.accessToken) {
        localStorage.setItem("accessToken", loginData.accessToken);
      }

      // Clear temp stored credentials
      sessionStorage.removeItem("pendingEmail");
      sessionStorage.removeItem("pendingPassword");

      // TODO: you can redirect according to role later
      navigate("/dashboard/student");
    } catch (err) {
      setErrorMsg(err.message || "Error verifying code");
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
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verificar código</CardTitle>
          <CardDescription>
            Ingresa el código de 6 dígitos enviado a{" "}
            <span className="font-medium">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificación</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="••••••"
                value={code}
                onChange={handleChangeCode}
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Solo números, el código expira en pocos minutos.
              </p>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verificando..." : "Verificar y continuar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ¿Ya verificaste tu cuenta? Inicia sesión
            </button>
            <button
              onClick={() => navigate("/register")}
              className="block w-full text-sm text-muted-foreground hover:text-foreground"
            >
              ← Volver al registro
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCode;
