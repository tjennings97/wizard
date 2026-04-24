/**
 * if user not logged in or session expired, show login
 * else, show generic welcome, user can use navbar to move forward for now
 */

import { useAuth } from "../contexts/AuthContext.jsx"
import LoginForm from "../components/LoginForm.jsx"

function Home() {
    const { user } = useAuth();

return <LoginForm />
    

}

export default Home