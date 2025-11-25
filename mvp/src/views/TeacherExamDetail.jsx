import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Database, ArrowLeft, Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const TeacherExamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [exam, setExam] = useState(null);       // info del examen
    const [students, setStudents] = useState([]); // estudiantes asignados al examen

    const [searchTerm, setSearchTerm] = useState("");
    const [showAssignPanel, setShowAssignPanel] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState("");

    // 🔹 Lista de estudiantes disponibles para asignar (desde /users/roles/3)
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentsError, setStudentsError] = useState("");

    // ============================
    // 1️⃣ Cargar info del examen
    // ============================
    useEffect(() => {
        const fetchExamInfo = async () => {
            if (!accessToken || !id) return;

            setLoading(true);
            setErrorMsg("");

            try {
                const res = await fetch(`${API_URL}/exams/id/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: "include",
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                        data.message || "Error al cargar la información del examen"
                    );
                }

                const data = await res.json();
                console.log("[TeacherExamDetail] API response:", data.exam);

                setExam(data.exam);
                // OJO: en tu payload viene como Students (capital S)
                setStudents(data.exam.Students || []);
            } catch (err) {
                console.error("[TeacherExamDetail] error:", err);
                setErrorMsg(err.message || "Error inesperado");
            } finally {
                setLoading(false);
            }
        };

        fetchExamInfo();
    }, [accessToken, id]);

    // ==========================================
    // 2️⃣ Cargar lista de estudiantes (rol=3)
    //    cuando se abre el panel de asignación
    // ==========================================
    const fetchAvailableStudents = async () => {
        // Si ya se cargaron una vez, no vuelvas a pedir
        if (availableStudents.length > 0 || loadingStudents) return;

        if (!accessToken) return;

        try {
            setLoadingStudents(true);
            setStudentsError("");

            const res = await fetch(`${API_URL}/users/roles/3`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(
                    data.message || "Error al cargar la lista de estudiantes"
                );
            }

            const data = await res.json();
            // Data esperada: { ok, roleID, count, users: [...] }
            const rawUsers = data.users || [];
            
            const normalized = rawUsers.map((u) => ({
                id: u.UserID || u.id,
                name: u.FullName || u.name,
                email: u.Email || u.email,
            }));

            setAvailableStudents(normalized);
        } catch (err) {
            console.error("[TeacherExamDetail] error fetch students:", err);
            setStudentsError(err.message || "Error al cargar estudiantes");
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleToggleAssignPanel = () => {
        const next = !showAssignPanel;
        setShowAssignPanel(next);
        if (next) {
            // cuando se abre el panel, cargamos estudiantes (si aún no están)
            fetchAvailableStudents();
        }
    };

    // =====================================
    // 3️⃣ Lógica para asignar un estudiante
    // =====================================
    const availableToAssign = availableStudents.filter(
        (s) =>
            !students.some(
                (as) =>
                    (as.StudentID || as.id) === s.id // no listar los ya asignados
            )
    );

    const handleAssignStudent = () => {
        if (!selectedStudentId) return;

        const student = availableStudents.find(
            (s) => String(s.id) === String(selectedStudentId)
        );
        if (!student) return;

        // Aquí en realidad llamarías al backend: POST /exams/:examID/assign
        console.log(
            "[TeacherExamDetail] Asignar estudiante",
            student,
            "al examen",
            exam?.ExamID || id
        );

        // Solo UI mock: agregar al estado local
        setStudents((prev) => [
            ...prev,
            {
                id: student.id,
                name: student.name,
                email: student.email,
                status: "Pendiente",
                score: null,
            },
        ]);

        setSelectedStudentId("");
        setShowAssignPanel(false);
    };

    // =====================
    // 4️⃣ Helpers de UI
    // =====================
    const getStatusBadgeClasses = (status) => {
        if (status === "Completado") return "bg-success/10 text-success";
        if (status === "Pendiente") return "bg-muted text-muted-foreground";
        if (status === "En progreso") return "bg-primary/10 text-primary";
        return "bg-muted text-muted-foreground";
    };

    if (loading && !exam) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Cargando información del examen...
                </p>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-lg text-muted-foreground">
                        {errorMsg || "No se encontró información para este examen."}
                    </p>
                    <Button variant="outline" onClick={() => navigate("/dashboard/teacher")}>
                        Volver al dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // Derivar stats a partir de exam + students
    const assignedCount = exam.AssignedCount ?? students.length;
    const answeredCount = exam.AnsweredCount ?? 0;
    const avgScore = exam.AvgScore ?? null;

    // Status del examen derivado por fecha (simple)
    const now = new Date();
    let examStatus = "Activo";
    if (exam?.EndTime) {
        const end = new Date(exam.EndTime);
        if (end.getTime() < now.getTime()) {
            examStatus = "Cerrado";
        }
    }

    // Filtrado por búsqueda (nombre / email)
    const filteredStudents = students.filter((s) => {
        const name = s.FullName || s.name || "";
        const email = s.Email || s.email || "";
        return `${name} ${email}`.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // =====================
    // 5️⃣ Render
    // =====================
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                            SQLEvaluator
                        </span>
                    </div>
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

            <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
                {/* Info general examen */}
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-2xl">{exam.Title}</CardTitle>
                            <CardDescription>
                                {exam.Description || "Sin descripción"}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs ${examStatus === "Activo"
                                        ? "bg-success/10 text-success"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {examStatus}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {assignedCount} estudiantes inscritos
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Respondieron</p>
                            <p className="text-2xl font-bold text-primary">
                                {answeredCount} / {assignedCount}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Promedio general</p>
                            <p className="text-2xl font-bold text-success">
                                {avgScore !== null && avgScore !== undefined
                                    ? `${avgScore}%`
                                    : "—"}
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleToggleAssignPanel}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Añadir estudiantes
                            </Button>
                            <p className="text-xs text-muted-foreground max-w-xs text-left md:text-right">
                                Asigna nuevos estudiantes a este examen. En producción esto se
                                conectará a la lista real de estudiantes del curso.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Panel para asignar estudiantes */}
                {showAssignPanel && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Añadir estudiantes al examen
                            </CardTitle>
                            <CardDescription>
                                Selecciona un estudiante de la lista y asígnalo a este examen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:flex-1 space-y-2">
                                <select
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    disabled={loadingStudents || availableStudents.length === 0}
                                >
                                    <option value="">
                                        {loadingStudents
                                            ? "Cargando estudiantes..."
                                            : "Selecciona un estudiante..."}
                                    </option>
                                    {availableToAssign.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} — {student.email}
                                        </option>
                                    ))}
                                </select>

                                {studentsError && (
                                    <p className="text-xs text-red-500">{studentsError}</p>
                                )}
                                {!loadingStudents &&
                                    !studentsError &&
                                    availableStudents.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            No se encontraron estudiantes para asignar.
                                        </p>
                                    )}
                            </div>

                            <Button
                                onClick={handleAssignStudent}
                                disabled={!selectedStudentId || loadingStudents}
                            >
                                Asignar
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de estudiantes */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Estudiantes de este examen</CardTitle>
                                <CardDescription>
                                    Revisa quién ha respondido, sus notas y accede al detalle de
                                    cada intento.
                                </CardDescription>
                            </div>
                            <div className="relative w-full md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Nota</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => {
                                    const name = student.FullName || student.name;
                                    const email = student.Email || student.email;
                                    const status =
                                        student.status ||
                                        (student.score != null ? "Completado" : "Pendiente");
                                    const score = student.score;

                                    return (
                                        <TableRow key={student.StudentID || student.id}>
                                            <TableCell className="font-medium">{name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {email}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs ${getStatusBadgeClasses(
                                                        status
                                                    )}`}
                                                >
                                                    {status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {status === "Completado" &&
                                                    typeof score === "number" ? (
                                                    <span
                                                        className={`font-semibold ${score >= 90
                                                                ? "text-success"
                                                                : score >= 70
                                                                    ? "text-primary"
                                                                    : "text-destructive"
                                                            }`}
                                                    >
                                                        {score}%
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {status === "Completado" ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            navigate(
                                                                `/teacher/exams/${exam.ExamID || id
                                                                }/students/${student.StudentID || student.id}`
                                                            )
                                                        }
                                                    >
                                                        Ver detalles
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Pendiente de respuesta
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {filteredStudents.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No se encontraron estudiantes con ese criterio de búsqueda.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TeacherExamDetail;
