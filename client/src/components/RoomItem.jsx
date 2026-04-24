import { Link } from 'react-router-dom';

function RoomItem({room}) {

    return <li>
        <Link to={`/room/${room.id}`} state={{room}}>{room.id}: {room.status}</Link>
    </li>
}

export default RoomItem;