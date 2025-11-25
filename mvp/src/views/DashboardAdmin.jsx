import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, UserCheck, Trash2, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

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
                        <span className="text-sm text-muted-foreground">Administrador</span>
                        <Button variant="ghost" size="sm" onClick={logout_function}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
                    <p className="text-muted-foreground">Gestiona usuarios, permisos y configuración del sistema</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Usuarios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">245</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Estudiantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">198</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Profesores
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-success">45</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Exámenes Activos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-accent">32</div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Gestión de Usuarios
                                </CardTitle>
                                <CardDescription>Crear, editar o eliminar usuarios del sistema</CardDescription>
                            </div>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Usuario
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${user.role === "Profesor"
                                                        ? "bg-success/10 text-success"
                                                        : "bg-primary/10 text-primary"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${user.status === "Activo"
                                                        ? "bg-success/10 text-success"
                                                        : "bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm">
                                                <UserCheck className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardAdmin;
