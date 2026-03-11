import { createRoot } from 'react-dom/client';
import { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { socket } from "./socket.js";
import { AuthProvider, useAuth } from "./AuthContext";

function SocketHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server: ", socket.id)
    })
    return () => { };
  }, [navigate]);

  return null;
}

function Home() {
  // const [token, setToken] = useState(localStorage.getItem("token"));
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      login(data.token, data.user);

      console.log("Login successful:", data);

      navigate("/lobby");

    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <h1>Home Page</h1>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </>
  );
}

async function fetchRooms(token, navigate, setRooms) {

  try {
    const response = await fetch("/api/rooms", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });
    if (response.status === 401) {
      navigate("/")
      return;
    }
    const data = await response.json();
    setRooms(data);
    return;
  } catch (e) {
    console.log(e);
  }
}

function Lobby() {
  const [rooms, setRooms] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms(token, navigate, setRooms);
  }, []); // empty dependency array = run only once when component mounts

  return (
    <div>
      <h1>Lobby</h1>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <Link to={`/room/${room.id}`}>{room.id}: {room.status}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JoinRoomButton({ role, roomId }) {
  const navigate = useNavigate();
  const { token, user, gameRoleChange, gameRole } = useAuth();
  role = role.toLowerCase()

  async function addMemberToRoom() {
    console.log(`type of ${user.id} ${typeof(user.id)}`)
    try {
      const response = await fetch(`/api/rooms/${roomId}/members`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: user.id, role: role }),
        method: "POST"
      });
      if (response.status === 201) {
        console.log("sending join_room event");
        socket.emit("join_room", [roomId, user.username, role]);
      } else {
        throw new Error("room not joined")
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const handleRoomChange = (data) => {
      if (data.user === user.username && data.role === role) {
        gameRoleChange(role);
        navigate(`/room/${roomId}/game`);
      }
    };

    socket.on("userJoined", handleRoomChange);

    return () => {
      socket.off("userJoined", handleRoomChange);
    };
  }, []);

  return (
    <button onClick={addMemberToRoom}>
      Join as {role}
    </button>
  );
}

function LeaveRoomButton({ roomId }) {
  const navigate = useNavigate();
  const { token, user, gameRoleChange } = useAuth();

  async function removeMemberFromRoom() {
    try {
      const response = await fetch(`/api/rooms/${roomId}/members/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE"
      });
      if (response.status === 204) {
        console.log(`sending leave_room event roomId: ${roomId}, username: ${user.username}`);
        socket.emit("leave_room", [roomId, user.username]);
      } else {
        throw new Error("room not left")
      }
      // navigate(`/lobby`);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const handleRoomChange = (data) => {
      if (data.user === user.username) {
        gameRoleChange(null);
        navigate(`/lobby`);
      }
    };

    socket.on("userLeft", handleRoomChange);

    return () => {
      socket.off("userLeft", handleRoomChange);
    };
  }, []);

  return (
    <button onClick={removeMemberFromRoom}>
      Leave room
    </button>
  );
}

function StartGameButton({ roomId }) {
  // note: probably only users that are in the room 
  // should be able to start the game via the api
  const navigate = useNavigate();
  const { token, user, gameRole } = useAuth();
  const [buttonState, setButtonState] = useState([]);

  useEffect(() => {
    if (gameRole === "player") {
      setButtonState(false)
    } else {
      setButtonState(true)
    }
  }, [])

  async function startGame() {

    try {
      // roomId = Number(roomId)
      const response = await fetch(`/api/games`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_id: roomId, status: "active" }),
        method: "POST"
      });
      if (response.status === 201) {
        console.log(response.body)
        console.log(`sending start_game event roomId: ${roomId}, username: ${user.username}`);
        socket.emit("game_start", [roomId, user.username]);
      } else {
        console.log(response)
        throw new Error("game not started")
      }
      // navigate(`/lobby`);
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <button onClick={startGame} disabled={buttonState}>
      Start game
    </button>
  );
}

function Room() {
  const { token } = useAuth();
  const [room, setRoom] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [roomSpectators, setRoomSpectators] = useState([]);

  const { id } = useParams();

  async function fetchRoom() {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setRoom(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchRoomMembers() {

    try {
      const response = await fetch(`/api/rooms/${id}/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setRoomMembers(data.length > 0 ? data : []);
      setRoomPlayers(data.length > 0 ? data.filter(member => member.role === "player") : []);
      setRoomSpectators(data.length > 0 ? data.filter(member => member.role === "spectator") : []);

    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    fetchRoom();
  }, []); // empty dependency array = run only once when component mounts

  useEffect(() => {
    fetchRoomMembers();

  }, []); // empty dependency array = run only once when component mounts

  useEffect(() => {
    const handleRoomChange = () => {
      fetchRoom();
      fetchRoomMembers();
    };

    socket.on("userJoined", handleRoomChange);
    socket.on("userLeft", handleRoomChange);

    return () => {
      socket.off("userJoined", handleRoomChange);
      socket.off("userLeft", handleRoomChange);
    };
  }, []);

  // why am i clicking one button but it's like both??
  return (
    <div>
      <h1>Room {id}</h1>
      <p>Room {id} has {roomMembers.length} members</p>
      <p>Room {id} has {roomPlayers.length} players</p>
      <p>Room {id} has {roomSpectators.length} spectators</p>
      {(room.status === "waiting" || room.status === "open") && (
        <>
          <div>
            <JoinRoomButton role={"Player"} roomId={id} />
          </div>
          <div>
            <JoinRoomButton role={"Spectator"} roomId={id} />
          </div>

        </>
      )}

      {room.status === "playing" && (
        <JoinRoomButton role={"Spectator"} roomId={id} />
      )}

      {room.status !== "waiting" &&
        room.status !== "open" &&
        room.status !== "playing" && (
          <p>Room is closed</p>
        )}
    </div>
  );
}

function Game() {
  // button to start game early

  const { id } = useParams();
  const { token } = useAuth();
  const [room, setRoom] = useState([]);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [roomSpectators, setRoomSpectators] = useState([]);

  async function fetchRoom() {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setRoom(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function getUserDetails(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      return data
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchRoomMembers() {
    try {
      const response = await fetch(`/api/rooms/${id}/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      const users = await response.json();

      let players = []
      let spectators = []
      for (let user of users) {
        let details = await getUserDetails(user.user_id)
        if (user.role === "player") {
          players.push(details)
        } else {
          spectators.push(details)
        }
      }
      setRoomPlayers(players);
      setRoomSpectators(spectators);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    fetchRoom();
  }, []); // empty dependency array = run only once when component mounts
  useEffect(() => {
    fetchRoomMembers();
  }, []); // empty dependency array = run only once when component mounts

  useEffect(() => {
    const handleRoomChange = () => {
      fetchRoomMembers();
    };

    socket.on("userJoined", handleRoomChange);
    socket.on("userLeft", handleRoomChange);

    return () => {
      socket.off("userJoined", handleRoomChange);
      socket.off("userLeft", handleRoomChange);
    };
  }, []);

  return (
    <div>
      <div>
        <h2>Room {id}: {room.status}</h2>
      </div>
      <div>
        Players
        <ul>
          {roomPlayers.map(player => (
            <li key={player.id}>
              {player.username}
            </li>
          ))}
        </ul>
        Spectators
        <ul>
          {roomSpectators.map(spectator => (
            <li key={spectator.id}>
              {spectator.username}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <LeaveRoomButton roomId={id} />
        <StartGameButton roomId={id} />
      </div>
    </div>
  );
}

function Greeting() {
  const { user } = useAuth();
  return (
    <h3>
      Hello{user ? `, ${user.username}!` : "!"}
    </h3>
  )
}
function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navigation */}
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/lobby">Lobby</Link>
        </nav>
        <Greeting />

        <SocketHandler />
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} >
          </Route>
          <Route path="/room/:id" element={<Room />} />
          <Route path="/room/:id/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// createRoot(document.getElementById('root')).render(
//   <App />
// );

export default App