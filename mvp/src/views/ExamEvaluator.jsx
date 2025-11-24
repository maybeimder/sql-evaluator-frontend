import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Play, CheckCircle2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

const ExamEvaluator = () => {
  const navigate = useNavigate();
  const [sqlCode, setSqlCode] = useState("SELECT * FROM usuarios WHERE edad > 18;");
  const [output, setOutput] = useState("");

  const mockQuestion = {
    title: "Consulta de Usuarios Mayores de Edad",
    description: "Escribe una consulta SQL que devuelva todos los usuarios mayores de 18 años. La tabla se llama 'usuarios' y tiene las columnas: id, nombre, email, edad.",
    expectedOutput: "3 registros encontrados",
    points: 10,
  };

  const handleRunQuery = () => {
    // Mock execution
    setOutput("✓ Consulta ejecutada correctamente\n\n3 registros encontrados:\n\nid | nombre        | email              | edad\n1  | Ana García    | ana@email.com      | 24\n2  | Luis Pérez    | luis@email.com     | 31\n5  | María López   | maria@email.com    | 22");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/dashboard/student")}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Enviar Examen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/student")}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Question */}
        <div className="w-2/5 border-r border-border bg-card p-6 overflow-y-auto">
          <div className="mb-4">
            <span className="text-sm font-medium text-muted-foreground">Pregunta 1 de 5</span>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{mockQuestion.title}</CardTitle>
              <CardDescription>Valor: {mockQuestion.points} puntos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">{mockQuestion.description}</p>
              
              <div className="bg-muted p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-sm mb-2">Salida Esperada:</h4>
                <code className="text-sm text-muted-foreground">{mockQuestion.expectedOutput}</code>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Esquema de la Tabla:</h4>
                <pre className="text-sm text-muted-foreground font-mono">
{`usuarios (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100),
  edad INT
)`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1">
              ← Anterior
            </Button>
            <Button className="flex-1">
              Siguiente →
            </Button>
          </div>
        </div>

        {/* Right Side - Code Editor and Output */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 border-b border-border">
            <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Editor SQL</h3>
              <Button size="sm" onClick={handleRunQuery}>
                <Play className="h-4 w-4 mr-2" />
                Ejecutar
              </Button>
            </div>
            <div className="h-full p-4 bg-editor-bg">
              <Textarea
                value={sqlCode}
                onChange={(e) => setSqlCode(e.target.value)}
                className="h-full font-mono text-sm bg-editor-bg text-editor-text border-none resize-none focus-visible:ring-0"
                placeholder="Escribe tu consulta SQL aquí..."
              />
            </div>
          </div>

          {/* Output */}
          <div className="h-1/3 border-t border-border">
            <div className="bg-card border-b border-border px-4 py-2">
              <h3 className="font-semibold text-foreground">Resultado</h3>
            </div>
            <div className="h-full p-4 bg-output-bg overflow-y-auto">
              {output ? (
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                  {output}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Haz clic en "Ejecutar" para ver el resultado de tu consulta
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEvaluator;
