import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken") || null
    );

    let initialUser = null;

    try {
        const stored = localStorage.getItem("user");
        if (stored && stored !== "undefined") {
            initialUser = JSON.parse(stored);
        }
    } catch (e) {
        initialUser = null;
    }

    const [user, setUser] = useState(initialUser)

    function login(token, refreshToken, userData) {
        setAccessToken(token);
        setUser(userData);
        localStorage.setItem("accessToken",  token);
        localStorage.setItem("refreshToken", refreshToken);  // ← guardar
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
        const storedRefresh = localStorage.getItem("refreshToken");
        if (!storedRefresh) return logout();

            try {
                const res = await fetch(`${API_URL}/auth/refresh-token`, {
                    method: "POST",
                    credentials: "include",
                    body    : JSON.stringify({ refreshToken: storedRefresh }),

                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                localStorage.setItem("accessToken", data.accessToken);
                setAccessToken(data.accessToken);
            } catch {
                sessionStorage.setItem("session_expired", "1");
                logout();
            }
        }, 1000 * 60 * 10);

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
