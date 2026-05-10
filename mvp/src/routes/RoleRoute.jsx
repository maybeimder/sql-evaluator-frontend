import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const hasRole = user.Roles?.some((r) => allowedRoles.includes(r));

    if (!hasRole) return <Navigate to="/unauthorized" replace />;

    return children;
}
