import { useRef, useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Database, ArrowLeft, Plus, Trash2, Download, Upload, Server, HardDrive, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { motion } from "framer-motion";

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

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-background pb-12">

            {/* Navbar */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">QueryLogic</span>
                    </div>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => navigate("/dashboard/teacher")}
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition-all duration-200 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Volver al Panel</span>
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-8 py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {/* Header y Botones de acción */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestión de Datos</p>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Bases de Datos</h1>
                            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                                Administra las bases de datos disponibles para tus exámenes. Crea nuevas instancias, importa esquemas existentes o limpia datos antiguos.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => importSqlFileInputRef.current?.click()}
                                className="gap-2 border-white/10 bg-card/50 backdrop-blur-md text-foreground hover:bg-white/5 transition-all duration-300 active:scale-95"
                            >
                                <Upload className="h-4 w-4 text-muted-foreground" />
                                Importar SQL
                            </Button>
                            <Button
                                onClick={() => newDbFileInputRef.current?.click()}
                                className="gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                            >
                                <Plus className="h-4 w-4" />
                                Nueva Base de Datos
                            </Button>
                            <input ref={newDbFileInputRef} type="file" accept=".bak,.sql" className="hidden" onChange={handleNewDatabaseFileChange} />
                            <input ref={importSqlFileInputRef} type="file" accept=".sql" className="hidden" onChange={handleImportSqlFileChange} />
                        </div>
                    </motion.div>

                    {/* Skeletons de Carga */}
                    {isLoading && (
                        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-card/20 border border-white/5 rounded-2xl p-6 h-64 animate-pulse flex flex-col">
                                    <div className="flex gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
                                        <div className="space-y-2 flex-1 mt-1">
                                            <div className="h-4 bg-white/5 rounded w-1/2"></div>
                                            <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="h-8 bg-white/5 rounded-lg w-full"></div>
                                        <div className="h-8 bg-white/5 rounded-lg w-full"></div>
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                                        <div className="h-8 bg-white/5 rounded-md flex-1"></div>
                                        <div className="h-8 bg-white/5 rounded-md w-10"></div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Grid de bases de datos */}
                    {!isLoading && databases.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {databases.map(db => (
                                <motion.div variants={itemVariants} key={db.id} className="group h-full">
                                    <div className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 h-full flex flex-col relative overflow-hidden">
                                        {/* Glow effect */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500"></div>

                                        {/* Header de la card */}
                                        <div className="flex items-start gap-4 mb-6 relative z-10">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                                                <Database className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-foreground truncate" title={db.name}>{db.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed" title={db.description}>{db.description}</p>
                                            </div>
                                        </div>

                                        {/* Info Badges */}
                                        <div className="space-y-3 mb-6 flex-1 relative z-10">
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-white/5 group-hover:bg-black/30 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground font-medium">Tablas</span>
                                                </div>
                                                <span className="text-xs font-bold text-foreground bg-white/5 px-2 py-0.5 rounded border border-white/5">{formatTables(db.tables)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-white/5 group-hover:bg-black/30 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground font-medium">Tamaño</span>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">{formatSize(db.sizeBytes)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 border border-white/5 group-hover:bg-black/30 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground font-medium">Creada</span>
                                                </div>
                                                <span className="text-xs font-bold text-foreground">{new Date(db.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })}</span>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto relative z-10">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-2 text-xs border-white/10 text-foreground hover:bg-white/5 hover:text-primary transition-all duration-200"
                                                onClick={() => alert(`Exportando ${db.name}...`)}
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Exportar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteDatabase(db)}
                                                className="w-9 px-0 border-white/10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 group-hover:border-white/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && databases.length === 0 && (
                        <motion.div variants={itemVariants} className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-sm mt-8">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
                                <Database className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">
                                No hay bases de datos creadas
                            </h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                                Comienza subiendo un archivo SQL o creando una base de datos nueva para poder diseñar y estructurar exámenes prácticos.
                            </p>
                            <Button
                                onClick={() => newDbFileInputRef.current?.click()}
                                size="lg"
                                className="gap-2 font-medium shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <Plus className="h-5 w-5" />
                                Crear Primera Base de Datos
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default DatabasesList;