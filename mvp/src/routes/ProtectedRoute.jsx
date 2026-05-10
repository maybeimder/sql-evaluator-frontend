import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children }) {
    const { accessToken } = useAuth();
    const location = useLocation();

    if (!accessToken) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
}
