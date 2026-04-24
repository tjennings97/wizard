import { useState } from "react";

function Greeting() {

    // get name
    const [name, setName] = useState(null);
    if (name === null) {
        setName("user")
        console.log("null name")
    }

    return <div className="greeting">
        Welcome, {name}!
    </div>
}

export default Greeting;