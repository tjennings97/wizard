import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { token, checkCurrentToken, logout } = useAuth();
    
    // Double check: Do we have a token AND is it still valid?
    if (!token || !checkCurrentToken()) {
        console.log("in protectedRoute")
        // If it exists but is expired, clear it out properly
        if (token) logout(); 
        
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;