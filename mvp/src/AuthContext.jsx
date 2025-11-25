import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken") || null
    );
    const [user, setUser] = useState(
        localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
    );

    function login(token, userData) {
        setAccessToken(token);
        setUser(userData);

        // Persistir solo el accessToken (seguro)
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
    }

    function logout() {
        setAccessToken(null);
        setUser(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
    }

    // 🔄 REFRESH AUTOMÁTICO
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/auth/refresh-token`, {
                    method: "POST",
                    credentials: "include",
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                login(data.accessToken, data.user); // Actualiza sesión
            } catch {
                logout();
            }
        }, 1000 * 60 * 5); // cada 5 minutos

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
