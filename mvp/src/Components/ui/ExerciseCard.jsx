import { Clock, Code2, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

const statusConfig = {
  pendiente: { label: "Pendiente", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  completado: { label: "Completado", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  en_progreso: { label: "En progreso", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
};

const typeConfig = {
  SQL: { icon: Code2, color: "text-primary", bg: "bg-primary/10" },
  pseudocodigo: { icon: FileText, color: "text-accent", bg: "bg-accent/10" },
};

const ExerciseCard = ({
  title,
  type = "SQL",
  status = "pendiente",
  course,
  points,
  date,
  onAction,
  actionLabel = "Abrir",
}) => {
  const statusStyle = statusConfig[status] || statusConfig.pendiente;
  const typeStyle = typeConfig[type] || typeConfig.SQL;
  const TypeIcon = typeStyle.icon;

  return (
    <div className="bg-card border border-border hover:border-primary/40 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 group">

      {/* Ícono tipo */}
      <div className={`w-10 h-10 ${typeStyle.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <TypeIcon className={`h-5 w-5 ${typeStyle.color}`} />
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {course && (
            <span className="text-xs text-muted-foreground">{course}</span>
          )}
          {date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {date}
            </div>
          )}
          {points && (
            <span className="text-xs text-muted-foreground">{points} pts</span>
          )}
        </div>
      </div>

      {/* Badge tipo */}
      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ color: type === "SQL" ? "#6366f1" : "#a78bfa", background: type === "SQL" ? "rgba(99,102,241,0.1)" : "rgba(167,139,250,0.1)" }}>
        {type}
      </span>

      {/* Badge estado */}
      <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
        style={{ color: statusStyle.color, background: statusStyle.bg }}>
        {statusStyle.label}
      </span>

      {/* Botón acción */}
      {status !== "completado" && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline flex-shrink-0"
        >
          {actionLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {status === "completado" && (
        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
      )}
    </div>
  );
};

export default ExerciseCard;