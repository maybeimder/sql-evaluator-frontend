import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database, Plus, Trash2, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CreateExam = () => {
  const navigate = useNavigate();
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState([
    { id: 1, title: "", description: "", expectedOutput: "", points: 10 },
  ]);

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      title: "",
      description: "",
      expectedOutput: "",
      points: 10,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar Examen
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/teacher")}>
              <LogOut className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Crear Nuevo Examen</h1>
          <p className="text-muted-foreground">Define las preguntas y configuración del examen SQL</p>
        </div>

        {/* Exam Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Examen</CardTitle>
            <CardDescription>Datos generales del examen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examTitle">Título del Examen</Label>
              <Input
                id="examTitle"
                placeholder="ej: SQL Básico - Consultas SELECT"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Fecha límite</Label>
                <Input id="deadline" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input id="duration" type="number" placeholder="60" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Preguntas</h2>
            <Button onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Pregunta
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pregunta {index + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título de la Pregunta</Label>
                  <Input placeholder="ej: Consulta de usuarios activos" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción/Enunciado</Label>
                  <Textarea
                    placeholder="Describe la tarea que debe realizar el estudiante..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Consulta SQL Ejemplo (Solución)</Label>
                    <Textarea
                      placeholder="SELECT * FROM usuarios WHERE activo = 1;"
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salida Esperada</Label>
                    <Textarea
                      placeholder="Describe o muestra el resultado esperado"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Puntos</Label>
                  <Input type="number" defaultValue={10} className="w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Selection */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Base de Datos</CardTitle>
            <CardDescription>Selecciona la base de datos para este examen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Base de datos disponibles</Label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                <option>Base de datos: Usuarios</option>
                <option>Base de datos: Productos</option>
                <option>Base de datos: Biblioteca</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button className="flex-1" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Guardar Examen
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/dashboard/teacher")}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
