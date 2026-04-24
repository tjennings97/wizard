import NavBar from "./components/NavBar";
import Greeting from "./components/Greeting"
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import { Route, Routes } from "react-router-dom";
import { RoomProvider } from "./contexts/RoomContext";
import { AuthProvider } from "./contexts/AuthContext";

function App2() {
    return (
        <AuthProvider>
            <RoomProvider>
                <NavBar />
                <Greeting />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home /> } />
                        <Route path="/lobby" element={<Lobby />} />
                        <Route path="/room/:id" element={<Room />} />
                    </Routes>
                </main>
            </RoomProvider>
        </AuthProvider>

    );
}

export default App2;