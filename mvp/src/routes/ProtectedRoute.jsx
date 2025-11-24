import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children }) {
    const { accessToken } = useAuth();
    console.log(accessToken)

    if (!accessToken) {
        console.log("No se encontro token")
        return <Navigate to="/login" replace />;
    }

    return children;
}
