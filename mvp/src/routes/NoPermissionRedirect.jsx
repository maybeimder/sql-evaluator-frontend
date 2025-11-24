import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NoPermissionRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Entro sin permiso")
        navigate("/login/no-permission", { replace: true });
    }, [navigate]);

    return null;
}
