import { useAuth } from "../contexts/AuthContext";

function Greeting() {
    const { user } = useAuth();

    // If user exists, use their name, otherwise default to "Guest" or "User"
    const displayName = user ? user.username : "Guest";

    return (
        <div className="greeting">
            Welcome, {displayName}!
        </div>
    );
}

export default Greeting;