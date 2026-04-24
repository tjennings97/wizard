import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => { // Added the "=" here
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [gameRole, setGameRole] = useState(localStorage.getItem("gameRole"));

    const login = (loginResponse) => {
        console.log(loginResponse)
        localStorage.setItem("token", loginResponse.token);
        localStorage.setItem("user", JSON.stringify(loginResponse.user));
        localStorage.removeItem("gameRole"); // Clear old roles on new login
        setToken(loginResponse.token);
        setUser(loginResponse.user);
        setGameRole(null);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("gameRole"); // Added this to clear storage
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

    const value = {
        token,
        user,
        gameRole,
        login,
        logout,
        gameRoleChange
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};