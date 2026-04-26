import { Link } from "react-router-dom";

function NavBar() {
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">Wizard App</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/lobby" className="nav-link">Lobby</Link>
        </div>
    </nav>
}

export default NavBar