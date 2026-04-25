import { useState, useEffect } from "react";
import { fetchUserById } from "../services/users";
import { useAuth } from "../contexts/AuthContext";

function UserItem({ id }) {

    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { token } = useAuth();

    //get room members
    useEffect(() => {

        const loadUser = async () => {
            try {
                const data = await fetchUserById(id, token);
                if (data.error !== undefined) {
                    throw { error: data.error }
                }
                setUser(data)
            } catch (err) {
                console.log(err);
                setError(true)
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    return <li className="user-item">
        {loading ? (
            <>Loading...</>
        ) : (error ? (
            <>There was an error loading this user.</>
        ) : (
           <>{user.username}</>
        ))}
    </li>
}

export default UserItem;