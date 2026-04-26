import { useAuth } from "../contexts/AuthContext.jsx";
import LoginForm from "../components/LoginForm.jsx";

function Home() {
    const { token, checkCurrentToken, logout } = useAuth();

    const isSessionValid = token && checkCurrentToken();

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