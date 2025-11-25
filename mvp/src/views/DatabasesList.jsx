// Importación de componentes UI y utilidades
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ArrowLeft, Plus, Trash2, Download, Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * DatabasesList - Vista para gestionar bases de datos
 * Permite ver, crear y administrar bases de datos para los exámenes
 */
const DatabasesList = () => {
  const navigate = useNavigate();

  // Datos de ejemplo de bases de datos (mock data inicial)
  const initialDatabases = [
    {
      id: 1,
      name: "Northwind",
      description: "Base de datos de ejemplo con ventas, productos y clientes",
      tables: 13,
      size: "2.4 MB",
      exams: 5,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "University",
      description: "Sistema académico con estudiantes, cursos y profesores",
      tables: 8,
      size: "1.8 MB",
      exams: 3,
      createdAt: "2024-02-20",
    },
    {
      id: 3,
      name: "Library",
      description: "Gestión de biblioteca con libros, préstamos y usuarios",
      tables: 6,
      size: "1.2 MB",
      exams: 2,
      createdAt: "2024-03-10",
    },
    {
      id: 4,
      name: "E-Commerce",
      description: "Tienda online con productos, pedidos y clientes",
      tables: 10,
      size: "3.1 MB",
      exams: 4,
      createdAt: "2024-02-05",
    },
  ];

  const [databases, setDatabases] = useState(initialDatabases);

  // Refs para los inputs de archivo "ocultos"
  const newDbFileInputRef = useRef(null);
  const importSqlFileInputRef = useRef(null);

  // 👉 Nueva Base de Datos: abrir file picker (.bak / .sql)
  const handleNewDatabaseClick = () => {
    if (newDbFileInputRef.current) {
      newDbFileInputRef.current.click();
    }
  };

  // Cuando el usuario selecciona un archivo para "Nueva Base de Datos"
  const handleNewDatabaseFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Nombre "bonito" sin extensión
    const baseName = file.name.replace(/\.(bak|sql)$/i, "");

    const newDb = {
      id: Date.now(),
      name: baseName || file.name,
      description: "Base de datos importada desde archivo",
      tables: 0, // esto vendrá realmente del backend
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      exams: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setDatabases((prev) => [newDb, ...prev]);

    // Limpia el input para permitir volver a seleccionar el mismo archivo si se quiere
    event.target.value = "";
  };

  // 👉 Importar SQL: abrir file picker (.sql)
  const handleImportSqlClick = () => {
    if (importSqlFileInputRef.current) {
      importSqlFileInputRef.current.click();
    }
  };

  // Cuando el usuario selecciona un archivo SQL para importar
  const handleImportSqlFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Aquí en producción mandarías el archivo al backend
    alert(`Script SQL "${file.name}" listo para ser enviado al backend (mock).`);

    event.target.value = "";
  };

  // 👉 Exportar: por ahora solo simulamos
  const handleExportDatabase = (db) => {
    // En producción: llamada al backend para generar y descargar .bak o .sql
    alert(`Simulando exportación de la base de datos "${db.name}".`);
    console.log("Export DB (mock):", db);
  };

  // 👉 Eliminar: confirm + borrar del estado
  const handleDeleteDatabase = (db) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la base de datos "${db.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDatabases((prev) => prev.filter((item) => item.id !== db.id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cabecera de la aplicación */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo y nombre de la aplicación */}
          <div className="flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SQLEvaluator</span>
          </div>
          {/* Botón para volver al dashboard */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/teacher")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Título y descripción */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bases de Datos</h1>
          <p className="text-muted-foreground">
            Administra las bases de datos disponibles para tus exámenes
          </p>
        </div>

        {/* Botones de acción para crear/importar bases de datos */}
        <div className="flex gap-4 mb-6">
          <Button onClick={handleNewDatabaseClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Base de Datos
          </Button>

          <Button variant="outline" onClick={handleImportSqlClick}>
            <Upload className="h-4 w-4 mr-2" />
            Importar SQL
          </Button>

          {/* Inputs de archivos ocultos */}
          <input
            ref={newDbFileInputRef}
            type="file"
            accept=".bak,.sql"
            className="hidden"
            onChange={handleNewDatabaseFileChange}
          />
          <input
            ref={importSqlFileInputRef}
            type="file"
            accept=".sql"
            className="hidden"
            onChange={handleImportSqlFileChange}
          />
        </div>

        {/* Grid de cards con las bases de datos */}
        <div className="grid md:grid-cols-2 gap-6">
          {databases.map((db) => (
            <Card key={db.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{db.name}</CardTitle>
                      <CardDescription className="mt-1">{db.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Información detallada de la base de datos */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tablas:</span>
                    <span className="font-medium text-foreground">{db.tables} tablas</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tamaño:</span>
                    <span className="font-medium text-foreground">{db.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usada en:</span>
                    <span className="font-medium text-foreground">{db.exams} exámenes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Creada:</span>
                    <span className="font-medium text-foreground">
                      {new Date(db.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Botones de acción para cada base de datos */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    // TODO: luego ver "Ver Esquema"
                    onClick={() => {
                      // por ahora solo un log
                      console.log("Ver esquema de", db);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Esquema
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleExportDatabase(db)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDatabase(db)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensaje cuando no hay bases de datos */}
        {databases.length === 0 && (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay bases de datos creadas
              </h3>
              <p className="text-muted-foreground mb-4">
                Crea o importa una base de datos para comenzar a diseñar tus exámenes
              </p>
              <Button onClick={handleNewDatabaseClick}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Base de Datos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatabasesList;
