import Login from "../views/Login";
import { useAuth } from "../AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    if (!user) return <Login />;

    const hasRole = user.Roles?.some((r) => allowedRoles.includes(r));

    if (!hasRole) {
        return <Login noPermission={true} />;
    }

    return children;
}
