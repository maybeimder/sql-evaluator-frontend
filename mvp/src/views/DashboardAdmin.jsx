import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, UserCheck, Trash2, Plus, CheckCircle2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Components/DashboardLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";

const DashboardAdmin = () => {
    const navigate = useNavigate();

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
        <DashboardLayout>
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Panel de Control</p>
                            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Panel de Administración</h1>
                            <p className="text-muted-foreground text-sm">Gestiona usuarios, permisos y configuración del sistema</p>
                        </div>
                        <div className="flex items-center gap-2 bg-card/60 border border-white/5 px-4 py-2 rounded-xl text-xs text-muted-foreground self-start sm:self-auto">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            Sistema operativo
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8"
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
                                <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/60 transition-colors">+12 este mes</p>
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
                                <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary/60 transition-colors">82% del total</p>
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
                                <p className="text-xs text-muted-foreground mt-1 group-hover:text-success/60 transition-colors">18% del total</p>
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
                                <p className="text-xs text-muted-foreground mt-1 group-hover:text-accent/60 transition-colors">En este periodo</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Atajos rápidos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
                >
                    {[
                        { label: "Ver Profesores", icon: ShieldAlert, color: "text-success", bg: "bg-success/10", border: "hover:border-success/30" },
                        { label: "Ver Estudiantes", icon: Users, color: "text-primary", bg: "bg-primary/10", border: "hover:border-primary/30" },
                        { label: "Crear Usuario", icon: Plus, color: "text-accent", bg: "bg-accent/10", border: "hover:border-accent/30" },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 bg-card/30 border border-white/5 ${item.border} rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all duration-200 group`}>
                            <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</span>
                        </div>
                    ))}
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
                            <div className="rounded-md border border-white/5 overflow-hidden overflow-x-auto">
                                <Table className="min-w-[600px]">
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
                                                                onClick={() => navigate(`/teacher/${user.id}`, { state: { teacherId: user.id } })} 
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
        </DashboardLayout>
    );
};

export default DashboardAdmin;
