import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [gameRole, setGameRole] = useState(localStorage.getItem("gameRole"))

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = (newToken, userInfo) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userInfo));
        localStorage.removeItem("gameRole");
        setToken(newToken);
        setUser(userInfo);
        setGameRole(null);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setGameRole(null);
    };

    const gameRoleChange = (role) => {
        if (role === "player" || role === "spectator") {
            localStorage.setItem("gameRole", role);
        } else {
            localStorage.removeItem("gameRole");
        }
        setGameRole(role);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading, gameRole, gameRoleChange }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);