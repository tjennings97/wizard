import { LeaveRoomButton, JoinRoomButton } from "./Buttons";
import { useAuth } from "../contexts/AuthContext";


function Game () {
    const { user, token, gameRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    /**
     * When the game is started either via the Start Game button 
     * or via max players logic, the server will start a game instance.
     * The details of the game instance will be passed to each client via
     * socket. This means my next steps involve setting up the game logic
     * on the server side and sockets on both the client and server. Some
     * socket implementation is already in place.
     */

}

export default Game;