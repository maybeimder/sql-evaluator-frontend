import { useState, useEffect } from "react";
import {
  Users, ChevronDown, Trash2, UserPlus, FolderPlus,
  Mail, Activity, GraduationCap, Search, X, Check,
  AlertTriangle, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;
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
  const [groups, setGroups]                   = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [dropdownOpen, setDropdownOpen]       = useState(false);
  const [newGroupName, setNewGroupName]       = useState("");
  const [addSearch, setAddSearch]             = useState("");
  const [addResults, setAddResults]           = useState([]);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [feedback, setFeedback]               = useState(null);
  const [allStudents, setAllStudents]         = useState(null);
  const [allExams, setAllExams]               = useState([]);
  const [selectedExamId, setSelectedExamId]   = useState("");

  const [studentsMap, setStudentsMap]         = useState({});
  const [groupStats, setGroupStats]           = useState({});
  const [isLoading, setIsLoading]             = useState(true);

  const selectedGroup = groups.find((g) => g.GroupID === selectedGroupId);
  const selectedGroupStudents = studentsMap[selectedGroupId] || [];
  const currentStats = groupStats[selectedGroupId] || { average: 0, completedExams: 0 };

  const activeStudents = currentStats.completedExams > 0 ? selectedGroupStudents.length : 0;
  const avgScore = typeof currentStats.average === 'number' ? currentStats.average.toFixed(1) : "0.0";

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Cargar grupos iniciales
  useEffect(() => {
    fetch(`${API_URL}/groups`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGroups(data);
          if (data.length > 0) {
            setSelectedGroupId(data[0].GroupID);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });

    fetch(`${API_URL}/exams`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.exams)) {
          setAllExams(data.exams);
        } else if (Array.isArray(data)) {
          setAllExams(data);
        }
      })
      .catch(console.error);
  }, []);

  // Cargar estudiantes y stats cuando cambia el grupo
  useEffect(() => {
    if (!selectedGroupId) return;

    fetch(`${API_URL}/groups/students/${selectedGroupId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudentsMap(prev => ({ ...prev, [selectedGroupId]: data }));
        }
      })
      .catch(console.error);

    fetch(`${API_URL}/groups/${selectedGroupId}/average`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setGroupStats(prev => ({ ...prev, [selectedGroupId]: data }));
        }
      })
      .catch(console.error);
  }, [selectedGroupId]);

  // Crear grupo
  const handleCreateGroup = async () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    
    const exists = groups.some((g) => g.GroupName.toLowerCase() === trimmed.toLowerCase());
    if (exists) { showFeedback("error", "Ya existe un grupo con ese nombre."); return; }
    
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ GroupName: trimmed })
      });
      const data = await res.json();
      
      if (res.ok && data.ok) {
        setGroups(prev => [...prev, data.group]);
        setSelectedGroupId(data.group.GroupID);
        setNewGroupName("");
        showFeedback("success", `Grupo "${trimmed}" creado correctamente.`);
      } else {
        showFeedback("error", data.error || "Error al crear grupo.");
      }
    } catch(err) {
      console.error(err);
      showFeedback("error", "Error de red al crear grupo.");
    }
  };

  // Eliminar grupo
  const handleDeleteGroup = async () => {
    try {
      const res = await fetch(`${API_URL}/groups/${selectedGroupId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
         setGroups((prev) => prev.filter((g) => g.GroupID !== selectedGroupId));
         const remaining = groups.filter((g) => g.GroupID !== selectedGroupId);
         setSelectedGroupId(remaining.length > 0 ? remaining[0].GroupID : null);
         setShowConfirm(false);
         showFeedback("success", `Grupo eliminado.`);
      } else {
         setShowConfirm(false);
         showFeedback("error", "El endpoint para eliminar grupos no está implementado en el backend.");
      }
    } catch(err) {
      setShowConfirm(false);
      showFeedback("error", "El endpoint para eliminar grupos falló de manera inesperada.");
    }
  };

  // Asignar Examen
  const handleAssignExam = async () => {
    if (!selectedGroupId || !selectedExamId) return;
    try {
      const res = await fetch(`${API_URL}/groups/assign-exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupID: selectedGroupId, examID: selectedExamId })
      });
      const data = await res.json().catch(() => ({}));
      
      if (res.ok && data.ok) {
        showFeedback("success", "Examen asignado al grupo exitosamente.");
        setSelectedExamId("");
      } else {
        showFeedback("error", data.error || "Error al asignar examen al grupo.");
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Error de red al asignar examen.");
    }
  };

  // Remover estudiante del grupo
  const handleRemoveStudent = async (student) => {
    try {
      const res = await fetch(`${API_URL}/groups/del-student`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupAssignmentID: student.GroupAssignmentID })
      });
      
      if (res.ok) {
        setStudentsMap(prev => ({
          ...prev,
          [selectedGroupId]: prev[selectedGroupId].filter(s => s.GroupAssignmentID !== student.GroupAssignmentID)
        }));
        showFeedback("success", `${student.FullName} removido del grupo.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showFeedback("error", data.error || "Error al remover estudiante.");
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Error de red al remover estudiante.");
    }
  };

  // Buscar estudiante para añadir
  const handleAddSearch = async (value) => {
    setAddSearch(value);
    if (!value.trim()) { setAddResults([]); return; }
    
    const filterData = (data) => {
      const results = data.filter((s) =>
        s.FullName.toLowerCase().includes(value.toLowerCase()) ||
        s.Email.toLowerCase().includes(value.toLowerCase())
      );
      setAddResults(results);
    };

    if (allStudents) {
      filterData(allStudents);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/users/roles/3`);
      if (!res.ok) return;
      const data = await res.json();
      
      if(data.ok && Array.isArray(data.users)) {
        setAllStudents(data.users);
        filterData(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Añadir estudiante al grupo
  const handleAddStudent = async (student) => {
    const alreadyIn = selectedGroupStudents.some((s) => s.UserID === student.UserID);
    if (alreadyIn) {
      showFeedback("error", `${student.FullName} ya pertenece a este grupo.`);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/groups/new-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupID: selectedGroupId, userID: student.UserID })
      });
      const data = await res.json();
      
      if (res.ok && data.ok) {
        setStudentsMap(prev => ({
          ...prev,
          [selectedGroupId]: [...(prev[selectedGroupId] || []), { ...student }]
        }));
        setAddSearch("");
        setAddResults([]);
        showFeedback("success", `${student.FullName} añadido al grupo.`);
      } else {
        showFeedback("error", data.error || "Error al añadir estudiante.");
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Error de red al añadir estudiante.");
    }
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
          groupName={selectedGroup?.GroupName}
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
                {selectedGroup?.GroupName ?? "Selecciona un grupo"}
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
                    key={g.GroupID}
                    onClick={() => { setSelectedGroupId(g.GroupID); setDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all hover:bg-white/5 ${
                      g.GroupID === selectedGroupId ? "text-primary font-bold bg-primary/5" : "text-foreground font-medium"
                    }`}
                  >
                    <span>{g.GroupName}</span>
                    <span className="text-xs text-muted-foreground">{(studentsMap[g.GroupID] || []).length} estudiantes</span>
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
                {selectedGroup?.GroupName ?? "Sin grupo"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedGroupStudents.length} estudiantes en este grupo
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
              {!selectedGroup || selectedGroupStudents.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Users className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Sin estudiantes</h3>
                  <p className="text-xs text-muted-foreground">Este grupo no tiene estudiantes aún. Añade uno abajo.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {selectedGroupStudents.map((student, idx) => {
                    const scoreStyle = getScoreStyle(student.averageScore || 0);
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
                          <span className="text-foreground">{student.examsTaken || 0}</span> resueltos
                        </span>
                        {/* Promedio */}
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-black px-2.5 py-1 rounded-md w-fit border"
                            style={{ color: scoreStyle.color, background: scoreStyle.bg, borderColor: scoreStyle.border }}
                          >
                            {student.averageScore || 0}%
                          </span>
                          <button
                            onClick={() => handleRemoveStudent(student)}
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            title="Remover estudiante"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Fila de acciones ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

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
                    const alreadyIn = selectedGroupStudents.some((st) => st.UserID === s.UserID);
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

          {/* Asignar Examen */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Asignar Examen</p>
            </div>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-black/40 border border-white/10 focus-visible:border-primary/50 rounded-xl mb-3 text-white appearance-none cursor-pointer"
            >
              <option value="">Selecciona un examen...</option>
              {allExams.map((exam) => (
                <option key={exam.ExamID} value={exam.ExamID}>{exam.Title || "Examen sin título"}</option>
              ))}
            </select>
            <Button
              onClick={handleAssignExam}
              disabled={!selectedExamId || !selectedGroupId}
              className="w-full h-9 text-sm bg-primary/90 hover:bg-primary text-white rounded-xl gap-2 disabled:opacity-40"
            >
              <ClipboardList className="h-4 w-4" />
              Asignar a Grupo
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
              Eliminar "{selectedGroup?.GroupName ?? "—"}"
            </Button>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default GroupManager;