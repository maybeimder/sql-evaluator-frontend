import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

function decodeJWT(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

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
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);  // ← guardar
        localStorage.setItem("user", JSON.stringify(userData));
    }

    function logout() {
        setAccessToken(null);
        setUser(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    }

    // 🔄 REFRESH AUTOMÁTICO DINÁMICO
    useEffect(() => {
        if (!accessToken) return;

        let delay = 1000 * 60 * 5; // 5 minutos por defecto si no es decodificable

        const payload = decodeJWT(accessToken);
        if (payload && payload.exp) {
            const expTimeMs = payload.exp * 1000;
            const timeUntilExpiry = expTimeMs - Date.now();
            
            // Refrescar 1 minuto antes de expirar, o al 75% del tiempo restante si es menor de 2 min
            delay = timeUntilExpiry > 120000 
                ? timeUntilExpiry - 60000 
                : Math.max(0, timeUntilExpiry * 0.75);
        }

        const timer = setTimeout(async () => {
            const storedRefresh = localStorage.getItem("refreshToken");
            if (!storedRefresh) return logout();

            try {
                const res = await fetch(`${API_URL}/auth/refresh-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ refreshToken: storedRefresh }),
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                localStorage.setItem("accessToken", data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                }
                setAccessToken(data.accessToken);
            } catch {
                sessionStorage.setItem("session_expired", "1");
                logout();
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [accessToken]);

    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = (url, options = {}) => {
            if (typeof url === "string" && url.startsWith(API_URL)) {
                const freshToken = localStorage.getItem("accessToken");
                const isFormData = options.body instanceof FormData;

                options = {
                    ...options,
                    credentials: "include",                          // ← agregar
                    headers: {
                        ...(isFormData ? {} : { "Content-Type": "application/json" }),
                        ...options.headers,
                        Authorization: `Bearer ${freshToken}`,
                    },
                };
            }
            return originalFetch(url, options);
        };

        // Restaurar al desmontar
        return () => { window.fetch = originalFetch; };
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
