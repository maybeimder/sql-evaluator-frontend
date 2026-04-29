import { useRef, useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Database, ArrowLeft, Plus, Trash2, Download, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const DatabasesList = () => {
    const { accessToken } = useAuth();
    const navigate = useNavigate();
    const [databases, setDatabases] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const newDbFileInputRef = useRef(null);
    const importSqlFileInputRef = useRef(null);

    const fetchDatabases = async () => {
        //if (!accessToken) { navigate("/login"); return; }
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/databases`, {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!data.ok || !Array.isArray(data.databases)) return;
            setDatabases(data.databases.map(db => ({
                id: db.DatabaseID,
                backendId: db._id,
                name: db.Name,
                description: db.Description || "Sin descripción",
                tables: typeof db.Tables === "number" ? db.Tables : 0,
                sizeBytes: typeof db.Size === "number" ? db.Size : 0,
                createdAt: db.UploadedAt || new Date().toISOString(),
                dumpFilePath: db.DumpFilePath,
            })));
        } catch (err) {
            console.error("Error fetching databases:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDatabases(); }, [accessToken]);

    const handleNewDatabaseFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!accessToken) { navigate("/login"); return; }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`${API_URL}/postgres/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
                credentials: "include",
            });
            const data = await res.json();
            if (!data.ok) alert("Error: " + (data.error || data.message));
            else { await fetchDatabases(); }
        } catch (err) { console.error(err); }
        event.target.value = "";
    };

    const handleImportSqlFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".sql")) { alert("Solo archivos .sql"); return; }
        if (!accessToken) { navigate("/login"); return; }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`${API_URL}/postgres/restore`, {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                credentials: "include",
                body: formData,
            });
            const data = await res.json();
            if (!data.ok) alert("Error: " + (data.error || data.message));
            else { await fetchDatabases(); }
        } catch (err) { console.error(err); }
        event.target.value = "";
    };

    const handleDeleteDatabase = async (db) => {
        if (!window.confirm(`¿Eliminar la base de datos "${db.name}"? Esta acción no se puede deshacer.`)) return;
        //if (!accessToken) { navigate("/login"); return; }
        try {
            const res = await fetch(`${API_URL}/databases/delete/${encodeURIComponent(db.id)}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                credentials: "include",
            });
            const data = await res.json();
            if (!data.ok) alert("Error: " + (data.error || data.message));
            else setDatabases(prev => prev.filter(item => item.id !== db.id));
        } catch (err) { console.error(err); }
    };

    const formatTables = (t) => (!t || t === 0) ? "Desconocido" : `${t} tablas`;
    const formatSize = (b) => (!b || b === 0) ? "Desconocido" : `${(b / (1024 * 1024)).toFixed(2)} MB`;

    return (
        <div className="min-h-screen bg-background">

            {/* Navbar */}
            <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Database className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-foreground">QueryLogic</span>
                    </div>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => navigate("/preview/teacher")}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al Dashboard
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-8 py-8">

                {/* Título */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Bases de Datos</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Administra las bases de datos disponibles para tus exámenes
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mb-6">
                    <Button
                        onClick={() => newDbFileInputRef.current?.click()}
                        className="gap-2"
                        style={{ boxShadow: '0 0 15px rgba(99,102,241,0.25)' }}
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Base de Datos
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => importSqlFileInputRef.current?.click()}
                        className="gap-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    >
                        <Upload className="h-4 w-4" />
                        Importar SQL
                    </Button>
                    <input ref={newDbFileInputRef} type="file" accept=".bak,.sql" className="hidden" onChange={handleNewDatabaseFileChange} />
                    <input ref={importSqlFileInputRef} type="file" accept=".sql" className="hidden" onChange={handleImportSqlFileChange} />
                </div>

                {isLoading && (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">Cargando bases de datos...</p>
                    </div>
                )}

                {/* Grid de bases de datos */}
                {!isLoading && databases.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {databases.map(db => (
                            <div
                                key={db.id}
                                className="bg-card border border-border hover:border-primary/50 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                            >
                                {/* Header de la card */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Database className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">{db.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{db.description}</p>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-2 mb-4 p-3 rounded-lg" style={{ background: 'rgba(17,19,31,0.5)' }}>
                                    {[
                                        { label: "Tablas", value: formatTables(db.tables) },
                                        { label: "Tamaño", value: formatSize(db.sizeBytes) },
                                        { label: "Usada en", value: "0 exámenes" },
                                        { label: "Creada", value: new Date(db.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                            <span className="text-xs font-semibold text-foreground">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2 pt-3 border-t border-border">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-2 text-xs border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                                        onClick={() => alert(`Exportando ${db.name}...`)}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Exportar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteDatabase(db)}
                                        className="hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && databases.length === 0 && (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Database className="h-7 w-7 text-primary/50" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2">
                            No hay bases de datos creadas
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Crea o importa una base de datos para comenzar a diseñar tus exámenes
                        </p>
                        <Button
                            onClick={() => newDbFileInputRef.current?.click()}
                            className="gap-2"
                            style={{ boxShadow: '0 0 15px rgba(99,102,241,0.25)' }}
                        >
                            <Plus className="h-4 w-4" />
                            Crear Primera Base de Datos
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatabasesList;