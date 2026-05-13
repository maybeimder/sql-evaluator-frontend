import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Button } from "@/components/ui/button";
import { Database, LogOut } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardLayout = ({ label, children }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    async function handleLogout() {
        logout();
        await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
        navigate("/");
    }

    const initials = user?.FullName
        ? user.FullName.split(" ").map(w => w[0]).slice(0, 2).join("")
        : "?";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 group-hover:shadow-primary/40 transition-all duration-300">
                            <Database className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">QueryLogic</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {label && <>{label} </>}
                            <span className="font-medium text-foreground">{user?.FullName || "—"}</span>
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary hover:scale-105 hover:bg-primary/20 transition-all duration-300 cursor-default">
                            {initials}
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 active:scale-95 transition-all duration-200">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </Button>
                    </div>
                </div>
            </header>
            {children}
        </div>
    );
};

export default DashboardLayout;
