import { useState } from "react";
import {
  Users, ChevronDown, Trash2, UserPlus, FolderPlus,
  Mail, Activity, GraduationCap, Search, X, Check,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// DATA MOCKEADA — reemplazar por fetches reales
const MOCK_GROUPS = [
  {
    id: 1,
    name: "Bases de Datos I - G1",
    students: [
      { UserID: "u1", FullName: "Alejandro Torres",  Email: "a.torres@uninorte.edu.co",  Code: "200123456", examsTaken: 5, averageScore: 87 },
      { UserID: "u2", FullName: "Mariana Pérez",     Email: "m.perez@uninorte.edu.co",   Code: "200198765", examsTaken: 4, averageScore: 72 },
      { UserID: "u3", FullName: "Carlos Herrera",    Email: "c.herrera@uninorte.edu.co", Code: "200112233", examsTaken: 3, averageScore: 55 },
      { UserID: "u4", FullName: "Valentina Díaz",    Email: "v.diaz@uninorte.edu.co",    Code: "200144556", examsTaken: 6, averageScore: 91 },
    ],
  },
  {
    id: 2,
    name: "Bases de Datos I - G2",
    students: [
      { UserID: "u5", FullName: "Sofía Ramírez",     Email: "s.ramirez@uninorte.edu.co", Code: "200167890", examsTaken: 2, averageScore: 68 },
      { UserID: "u6", FullName: "Miguel Ángel Ruiz", Email: "m.ruiz@uninorte.edu.co",    Code: "200134567", examsTaken: 5, averageScore: 83 },
    ],
  },
  {
    id: 3,
    name: "Taller SQL Avanzado",
    students: [
      { UserID: "u7", FullName: "Isabella Castro",   Email: "i.castro@uninorte.edu.co",  Code: "200178901", examsTaken: 7, averageScore: 95 },
    ],
  },
];

// Estudiantes de Roble disponibles para añadir
const MOCK_ALL_STUDENTS = [
  { UserID: "u8",  FullName: "Daniel Moreno",    Email: "d.moreno@uninorte.edu.co",   Code: "200190123" },
  { UserID: "u9",  FullName: "Lucía Suárez",     Email: "l.suarez@uninorte.edu.co",   Code: "200156789" },
  { UserID: "u10", FullName: "Andrés Gómez",     Email: "a.gomez@uninorte.edu.co",    Code: "200145678" },
  { UserID: "u1",  FullName: "Alejandro Torres", Email: "a.torres@uninorte.edu.co",   Code: "200123456" },
  { UserID: "u2",  FullName: "Mariana Pérez",    Email: "m.perez@uninorte.edu.co",    Code: "200198765" },
];
// ─────────────────────────────────────────────

const getScoreStyle = (score) => {
  if (score >= 80) return { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" };
  if (score >= 60) return { color: "#818cf8", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)" };
  return { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" };
};

const getInitials = (name) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("");

// ── Modal de confirmación ──────────────────────
const ConfirmModal = ({ groupName, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl shadow-black/50 mx-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-foreground">Eliminar grupo</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          ¿Estás seguro de que deseas eliminar el grupo{" "}
          <span className="text-foreground font-semibold">"{groupName}"</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-500/90 hover:bg-red-500 text-white border-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Componente principal ───────────────────────
const GroupManager = () => {
  const [groups, setGroups]                   = useState(MOCK_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState(MOCK_GROUPS[0].id);
  const [dropdownOpen, setDropdownOpen]       = useState(false);
  const [newGroupName, setNewGroupName]       = useState("");
  const [addSearch, setAddSearch]             = useState("");
  const [addResults, setAddResults]           = useState([]);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [feedback, setFeedback]               = useState(null); // { type: "success"|"error", msg }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  // Stats del grupo seleccionado
  const activeStudents = selectedGroup?.students.filter((s) => s.examsTaken > 0).length ?? 0;
  const avgScore = selectedGroup?.students.length
    ? (selectedGroup.students.reduce((sum, s) => sum + s.averageScore, 0) / selectedGroup.students.length).toFixed(1)
    : "0.0";

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Crear grupo
  const handleCreateGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    const exists = groups.some((g) => g.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) { showFeedback("error", "Ya existe un grupo con ese nombre."); return; }
    const newGroup = { id: Date.now(), name: trimmed, students: [] };
    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newGroup.id);
    setNewGroupName("");
    showFeedback("success", `Grupo "${trimmed}" creado correctamente.`);
    // TODO: POST /groups  con { name: trimmed }
  };

  // Eliminar grupo
  const handleDeleteGroup = () => {
    setGroups((prev) => prev.filter((g) => g.id !== selectedGroupId));
    setSelectedGroupId(groups.find((g) => g.id !== selectedGroupId)?.id ?? null);
    setShowConfirm(false);
    showFeedback("success", `Grupo "${selectedGroup.name}" eliminado.`);
    // TODO: DELETE /groups/:id
  };

  // Buscar estudiante para añadir
  const handleAddSearch = (value) => {
    setAddSearch(value);
    if (!value.trim()) { setAddResults([]); return; }
    const results = MOCK_ALL_STUDENTS.filter((s) =>
      s.FullName.toLowerCase().includes(value.toLowerCase()) ||
      s.Email.toLowerCase().includes(value.toLowerCase())
    );
    setAddResults(results);
    // TODO: GET /users/search?q=value  y reemplazar MOCK_ALL_STUDENTS
  };

  // Añadir estudiante al grupo
  const handleAddStudent = (student) => {
    const alreadyIn = selectedGroup.students.some((s) => s.UserID === student.UserID);
    if (alreadyIn) {
      showFeedback("error", `${student.FullName} ya pertenece a este grupo.`);
      return;
    }
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroupId
          ? { ...g, students: [...g.students, { ...student, examsTaken: 0, averageScore: 0 }] }
          : g
      )
    );
    setAddSearch("");
    setAddResults([]);
    showFeedback("success", `${student.FullName} añadido al grupo.`);
    // TODO: POST /groups/:id/students  con { userId: student.UserID }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="w-full pb-12">
      {showConfirm && (
        <ConfirmModal
          groupName={selectedGroup?.name}
          onConfirm={handleDeleteGroup}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="show">

        {/* ── Header ── */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Gestión Académica</p>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Gestión de Grupos</h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Crea, organiza y administra los grupos de tus estudiantes. Selecciona un grupo para ver su detalle y gestionar su membresía.
          </p>
        </motion.div>

        {/* ── Feedback toast ── */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {feedback.type === "success"
                ? <Check className="h-4 w-4 shrink-0" />
                : <X className="h-4 w-4 shrink-0" />}
              {feedback.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Selector de grupo ── */}
        <motion.div variants={itemVariants} className="mb-6 relative">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Grupo seleccionado</p>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 bg-card/40 backdrop-blur-md border border-white/10 hover:border-primary/40 rounded-2xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">
                {selectedGroup?.name ?? "Selecciona un grupo"}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 right-0 z-30 bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
              >
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setSelectedGroupId(g.id); setDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all hover:bg-white/5 ${
                      g.id === selectedGroupId ? "text-primary font-bold bg-primary/5" : "text-foreground font-medium"
                    }`}
                  >
                    <span>{g.name}</span>
                    <span className="text-xs text-muted-foreground">{g.students.length} estudiantes</span>
                  </button>
                ))}
                {groups.length === 0 && (
                  <p className="px-5 py-4 text-sm text-muted-foreground text-center">No hay grupos creados.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Stats cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {[
            { label: "Total de grupos",    value: groups.length,    color: "text-foreground", icon: Users,         iconColor: "text-foreground/60", iconBg: "bg-white/5 border-white/10" },
            { label: "Estudiantes activos", value: activeStudents,  color: "text-emerald-400", icon: Activity,     iconColor: "text-emerald-400",   iconBg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Promedio del grupo",  value: `${avgScore}%`,  color: "text-primary",    icon: GraduationCap, iconColor: "text-primary",       iconBg: "bg-primary/10 border-primary/20" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{stat.label}</p>
                    <p className={`text-4xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── Tabla de estudiantes del grupo ── */}
        <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/20 mb-6">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 bg-black/20">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {selectedGroup?.name ?? "Sin grupo"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedGroup?.students.length ?? 0} estudiantes en este grupo
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Encabezados */}
              <div className="grid grid-cols-[2.5fr_2fr_1.5fr_1fr] px-8 py-4 border-b border-white/5 bg-black/10">
                {["Estudiante", "Correo Electrónico", "Exámenes", "Promedio"].map((h, i) => (
                  <span key={i} className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{h}</span>
                ))}
              </div>

              {/* Filas */}
              {!selectedGroup || selectedGroup.students.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Users className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Sin estudiantes</h3>
                  <p className="text-xs text-muted-foreground">Este grupo no tiene estudiantes aún. Añade uno abajo.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {selectedGroup.students.map((student, idx) => {
                    const scoreStyle = getScoreStyle(student.averageScore);
                    return (
                      <motion.div
                        key={student.UserID}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="group grid grid-cols-[2.5fr_2fr_1.5fr_1fr] px-8 py-4 items-center hover:bg-white/5 transition-all duration-300 relative"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        {/* Nombre */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 group-hover:scale-110 transition-transform">
                            {getInitials(student.FullName)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors block">{student.FullName}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{student.Code}</span>
                          </div>
                        </div>
                        {/* Email */}
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          <Mail className="h-3.5 w-3.5 shrink-0 opacity-50" />
                          <span className="text-sm truncate font-medium">{student.Email}</span>
                        </div>
                        {/* Exámenes */}
                        <span className="text-sm text-muted-foreground font-medium">
                          <span className="text-foreground">{student.examsTaken}</span> resueltos
                        </span>
                        {/* Promedio */}
                        <span
                          className="text-xs font-black px-2.5 py-1 rounded-md w-fit border"
                          style={{ color: scoreStyle.color, background: scoreStyle.bg, borderColor: scoreStyle.border }}
                        >
                          {student.averageScore}%
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Fila de acciones ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Añadir estudiante */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Añadir estudiante</p>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={addSearch}
                onChange={(e) => handleAddSearch(e.target.value)}
                className="pl-8 h-9 text-sm bg-black/40 border-white/10 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl"
              />
            </div>
            {/* Resultados de búsqueda */}
            <AnimatePresence>
              {addResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-card border border-white/10 rounded-xl overflow-hidden mb-2 shadow-xl shadow-black/30"
                >
                  {addResults.map((s) => {
                    const alreadyIn = selectedGroup?.students.some((st) => st.UserID === s.UserID);
                    return (
                      <button
                        key={s.UserID}
                        onClick={() => handleAddStudent(s)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{s.FullName}</p>
                          <p className="text-[11px] text-muted-foreground">{s.Email}</p>
                        </div>
                        {alreadyIn
                          ? <span className="text-[10px] text-amber-400 font-bold border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0">Ya inscrito</span>
                          : <span className="text-[10px] text-emerald-400 font-bold border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Añadir</span>
                        }
                      </button>
                    );
                  })}
                </motion.div>
              )}
              {addSearch.trim() && addResults.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Sin resultados para "{addSearch}"</p>
              )}
            </AnimatePresence>
          </div>

          {/* Crear grupo */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <FolderPlus className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Crear nuevo grupo</p>
            </div>
            <Input
              placeholder="Nombre del grupo..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              className="h-9 text-sm bg-black/40 border-white/10 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl mb-3"
            />
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="w-full h-9 text-sm bg-primary/90 hover:bg-primary text-white rounded-xl gap-2 disabled:opacity-40"
            >
              <FolderPlus className="h-4 w-4" />
              Crear grupo
            </Button>
          </div>

          {/* Eliminar grupo */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-red-500/10 rounded-2xl p-5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="h-4 w-4 text-red-400" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Eliminar grupo</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Elimina permanentemente el grupo seleccionado y todos sus datos asociados.
            </p>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!selectedGroup}
              variant="ghost"
              className="w-full h-9 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 rounded-xl gap-2 disabled:opacity-40 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar "{selectedGroup?.name ?? "—"}"
            </Button>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default GroupManager;