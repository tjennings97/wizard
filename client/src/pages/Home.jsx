/**
 * if user not logged in or session expired, show login
 * else, show generic welcome, user can use navbar to move forward for now
 */

import { useAuth } from "../contexts/AuthContext.jsx";
import LoginForm from "../components/LoginForm.jsx";

function Home() {
    const { token, checkCurrentToken, logout } = useAuth();

    // 1. Determine if we are validly logged in
    const isSessionValid = token && checkCurrentToken();

    // 2. Handle side effects (logging out) inside a logic block, 
    // but better yet, let your AuthProvider's useEffect handle the auto-logout.
    // If you want to do it here, you should technically use a useEffect, 
    // but for the "Home" screen, we can just check the variable.

    return (
        <>
            {isSessionValid ? (
                <div>
                    <h1>Wizard App</h1>
                    <p>Use the navigation bar to get started!</p>
                </div>
            ) : (
                <LoginForm />
            )}
        </>
    );
}

export default Home;