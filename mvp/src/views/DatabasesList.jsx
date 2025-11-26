// Import UI components and utilities
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Database,
    ArrowLeft,
    Plus,
    Trash2,
    Download,
    Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const DatabasesList = () => {
    const { accessToken } = useAuth();
    const navigate = useNavigate();

    const [databases, setDatabases] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Hidden file inputs refs
    const newDbFileInputRef = useRef(null);
    const importSqlFileInputRef = useRef(null);

    // Fetch databases from backend
    const fetchDatabases = async () => {
        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            setIsLoading(true);

            const res = await fetch(`${API_URL}/databases`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: "include",
            });

            const data = await res.json();

            if (!data.ok || !Array.isArray(data.databases)) {
                console.error("Error fetching databases:", data);
                return;
            }

            const mapped = data.databases.map((db) => ({
                // Use DatabaseID as stable identifier for frontend actions
                id: db.DatabaseID,
                backendId: db._id,
                name: db.Name,
                description: db.Description || "No description provided",
                tables: typeof db.Tables === "number" ? db.Tables : 0,
                sizeBytes: typeof db.Size === "number" ? db.Size : 0,
                createdAt: db.UploadedAt || new Date().toISOString(),
                dumpFilePath: db.DumpFilePath,
            }));

            setDatabases(mapped);
        } catch (err) {
            console.error("Error fetching databases:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchDatabases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    // 👉 New Database: open file picker (.bak / .sql)
    const handleNewDatabaseClick = () => {
        if (newDbFileInputRef.current) {
            newDbFileInputRef.current.click();
        }
    };

    // When the user selects a file for "New Database"
    const handleNewDatabaseFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!accessToken) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/postgres/restore`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
                credentials: "include",
            });

            const data = await res.json();

            if (!data.ok) {
                alert("Error restoring database: " + (data.error || data.message));
            } else {
                alert("Database created: " + data.database);
                console.log("BACKEND RESULT", data);
                // Reload databases from backend so UI reflects real data
                await fetchDatabases();
            }
        } catch (err) {
            console.error(err);
            alert("Error sending file to backend");
        }

        event.target.value = "";
    };

    // 👉 Import SQL: open file picker (.sql)
    const handleImportSqlClick = () => {
        if (importSqlFileInputRef.current) {
            importSqlFileInputRef.current.click();
        }
    };

    // When the user selects a SQL file to import
    const handleImportSqlFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".sql")) {
            alert("Only .sql files are allowed");
            return;
        }

        if (!accessToken) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/postgres/restore`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: "include",
                body: formData,
            });

            const data = await res.json();

            if (!data.ok) {
                alert("Error importing SQL: " + (data.error || data.message));
            } else {
                alert(`SQL imported into database: ${data.database}`);
                // Reload databases after import
                await fetchDatabases();
            }
        } catch (err) {
            console.error(err);
            alert("Error sending SQL to backend");
        }

        event.target.value = "";
    };

    // 👉 Export: still mocked (backend export endpoint can be wired later)
    const handleExportDatabase = (db) => {
        alert(`Simulating export of database "${db.name}".`);
        console.log("Export DB (mock):", db);
    };

    // 👉 Delete: call backend and then update state
    const handleDeleteDatabase = async (db) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete the database "${db.name}"? This action cannot be undone.`
        );
        if (!confirmed) return;

        if (!accessToken) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/databases/delete/${encodeURIComponent(db.id)}`, // <-- :databaseID
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!data.ok) {
                alert(
                    "Error deleting database: " + (data.error || data.message || "")
                );
                return;
            }

            // Remove from local state
            setDatabases((prev) => prev.filter((item) => item.id !== db.id));
        } catch (err) {
            console.error("Error deleting database:", err);
            alert("Error deleting database");
        }
    };

    const formatTables = (tables) => {
        if (!tables || tables === 0) return "Desconocido";
        return `${tables} tablas`;
    };

    const formatSize = (sizeBytes) => {
        if (!sizeBytes || sizeBytes === 0) return "Desconocido";
        const mb = sizeBytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* App header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo and app name */}
                    <div className="flex items-center gap-2">
                        <Database className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                            SQLEvaluator
                        </span>
                    </div>
                    {/* Back to dashboard button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/dashboard/teacher")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Dashboard
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Title and description */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Bases de Datos
                    </h1>
                    <p className="text-muted-foreground">
                        Administra las bases de datos disponibles para tus exámenes
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 mb-6">
                    <Button onClick={handleNewDatabaseClick}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Base de Datos
                    </Button>

                    <Button variant="outline" onClick={handleImportSqlClick}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar SQL
                    </Button>

                    {/* Hidden file inputs */}
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

                {isLoading && (
                    <p className="text-muted-foreground mb-4">
                        Cargando bases de datos...
                    </p>
                )}

                {/* Databases grid */}
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
                                            <CardDescription className="mt-1">
                                                {db.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Detailed database info */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Tablas:</span>
                                        <span className="font-medium text-foreground">
                                            {formatTables(db.tables)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Tamaño:</span>
                                        <span className="font-medium text-foreground">
                                            {formatSize(db.sizeBytes)}
                                        </span>
                                    </div>
                                    {/* Exams is not provided by backend yet, so we can omit or use 0 */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Usada en:</span>
                                        <span className="font-medium text-foreground">
                                            0 exámenes
                                        </span>
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

                                {/* Action buttons per database */}
                                <div className="flex gap-2 pt-4 border-t border-border">
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

                {/* Empty state */}
                {!isLoading && databases.length === 0 && (
                    <Card className="mt-8">
                        <CardContent className="text-center py-12">
                            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No hay bases de datos creadas
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Crea o importa una base de datos para comenzar a diseñar tus
                                exámenes
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
