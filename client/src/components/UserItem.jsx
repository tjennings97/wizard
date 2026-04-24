import { useState, useEffect } from "react";
import { fetchUserById } from "../services/users";

function UserItem({ id }) {

    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    //get room members
    useEffect(() => {

        const loadUser = async () => {
            try {
                const data = await fetchUserById(id);
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