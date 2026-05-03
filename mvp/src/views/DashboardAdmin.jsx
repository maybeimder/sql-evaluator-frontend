import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Eye, Users, UserCheck, Trash2, Plus, LogOut, CheckCircle2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const logout = () => console.log("logout mock"); //IMPORTANTE: borrar luego de implementar el login

    async function logout_function() {
        logout();
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
        navigate("/")
    }

    const mockUsers = [
        { id: 1, name: "Juan Pérez", email: "juan@email.com", role: "Estudiante", status: "Activo" },
        { id: 2, name: "María González", email: "maria@email.com", role: "Profesor", status: "Activo" },
        { id: 3, name: "Carlos López", email: "carlos@email.com", role: "Estudiante", status: "Activo" },
        { id: 4, name: "Ana Martínez", email: "ana@email.com", role: "Profesor", status: "Inactivo" },
    ];

    // Variantes para animaciones Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 group-hover:shadow-primary/40 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">QueryLogic</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            Rol: <span className="font-medium text-foreground">Administrador</span>
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary hover:scale-105 hover:bg-primary/20 transition-all duration-300 cursor-default">
                            AD
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout_function}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 active:scale-95 transition-all duration-200">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
                        Panel de Administración
                    </h1>
                    <p className="text-muted-foreground">Gestiona usuarios, permisos y configuración del sistema</p>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ease-out group relative overflow-hidden h-full">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <Users className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    Total Usuarios
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    245
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ease-out group relative overflow-hidden h-full">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <Users className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    Estudiantes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    198
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-success/10 transition-all duration-300 ease-out group relative overflow-hidden h-full">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <ShieldAlert className="h-4 w-4 text-success opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    Profesores
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-success tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    45
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants} className="h-full">
                        <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 ease-out group relative overflow-hidden h-full">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-colors duration-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-foreground/80 transition-colors">
                                    <CheckCircle2 className="h-4 w-4 text-accent opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    Exámenes Activos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-accent tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                                    32
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* User Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="bg-card/40 backdrop-blur-md border-white/5 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                        Gestión de Usuarios
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Crear, editar o eliminar usuarios del sistema
                                    </CardDescription>
                                </div>
                                <Button className="relative overflow-hidden group/btn hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] active:scale-95 transition-all duration-200">
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <Plus className="h-4 w-4 group-hover/btn:rotate-90 transition-transform" />
                                        Nuevo Usuario
                                    </span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="rounded-md border border-white/5 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="font-medium text-foreground/70">Nombre</TableHead>
                                            <TableHead className="font-medium text-foreground/70">Email</TableHead>
                                            <TableHead className="font-medium text-foreground/70">Rol</TableHead>
                                            <TableHead className="font-medium text-foreground/70">Estado</TableHead>
                                            <TableHead className="text-right font-medium text-foreground/70">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockUsers.map((user, i) => (
                                            <TableRow 
                                                key={user.id}
                                                className="group border-white/5 hover:bg-white/[0.04] transition-colors animate-in fade-in slide-in-from-right-4"
                                                style={{ animationDelay: `${400 + (i * 100)}ms`, animationDuration: '400ms', animationFillMode: 'both' }}
                                            >
                                                <TableCell className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === "Profesor"
                                                            ? "bg-success/10 border-success/20 text-success"
                                                            : "bg-primary/10 border-primary/20 text-primary"
                                                            }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === "Activo"
                                                            ? "bg-success/10 border-success/20 text-success"
                                                            : "bg-muted/10 border-muted/20 text-muted-foreground"
                                                            }`}
                                                    >
                                                        {user.status === "Activo" && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                                                        )}
                                                        {user.status === "Inactivo" && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                                                        )}
                                                        {user.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-95 transition-all duration-200"
                                                            title="Editar usuario"
                                                        >
                                                            <UserCheck className="h-4 w-4" />
                                                        </Button>
                                                        {user.role === "Profesor" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-95 transition-all duration-200"
                                                                title="Ver detalles"
                                                                onClick={() => navigate("/preview/admin/teacher-detail", { state: { teacherId: user.id } })} //CAMBIAR RUTA DESPUÉS, SOLO PARA PRUEBAS
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all duration-200"
                                                            title="Eliminar usuario"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
