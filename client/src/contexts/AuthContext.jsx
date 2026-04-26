import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => { // Added the "=" here
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [gameRole, setGameRole] = useState(localStorage.getItem("gameRole"));
    const [expiry, setExpiry] = useState(localStorage.getItem("expiry"))

    const login = (loginResponse) => {
        // 2 hours in milliseconds
        const expireTime = Date.now() + (2 * 60 * 60 * 1000);

        localStorage.setItem("token", loginResponse.token);
        localStorage.setItem("user", JSON.stringify(loginResponse.user));
        localStorage.setItem("expiry", expireTime) // Expires after 2 hours
        localStorage.removeItem("gameRole"); // Clear old roles on new login

        setToken(loginResponse.token);
        setUser(loginResponse.user);
        setExpiry(expireTime)
        setGameRole(null);
    };

    useEffect(() => {
        // 1. Check immediately on mount/load
        const validate = () => {
            if (token && !checkCurrentToken()) {
                console.log("Heartbeat: Session expired. Clearing storage.");
                logout();
            }
        };

        validate();

        // 2. Check every 30 seconds in case the user is just idling on a page
        const interval = setInterval(validate, 30000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [token]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("gameRole");
        localStorage.removeItem("expiry");
        setToken(null);
        setUser(null);
        setExpiry(null)
        setGameRole(null);
    };

    const gameRoleChange = (role) => {
        if (role === "player" || role === "spectator") {
            localStorage.setItem("gameRole", role);
            setGameRole(role);
        } else {
            localStorage.removeItem("gameRole");
            setGameRole(null);
        }

    };

    const checkCurrentToken = () => {
        const storedExpiry = localStorage.getItem("expiry");
        if (!storedExpiry) return false;

        // Convert string to number for comparison
        return Number(storedExpiry) > Date.now();
    };

    const value = {
        token,
        user,
        gameRole,
        expiry,
        login,
        logout,
        gameRoleChange,
        checkCurrentToken
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};