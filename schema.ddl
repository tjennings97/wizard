CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'player')),

    created TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,
    status TEXT NOT NULL
        CHECK (status IN ('open', 'waiting', 'playing', 'finished', 'stale')),

    max_players INTEGER NOT NULL CHECK (max_players BETWEEN 3 AND 8),

    created TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE room_members (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role TEXT NOT NULL CHECK (role IN ('player', 'spectator')),
    seat_number INTEGER,

    created TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (room_id, user_id),

    CONSTRAINT seat_only_for_players
    CHECK (
        (role = 'player' AND seat_number IS NOT NULL)
     OR (role = 'spectator' AND seat_number IS NULL)
    )
);

CREATE UNIQUE INDEX unique_seat_per_room
ON room_members (room_id, seat_number)
WHERE seat_number IS NOT NULL;

CREATE TABLE games (
    id SERIAL PRIMARY KEY,

    room_id INTEGER NOT NULL REFERENCES rooms(id),
    status TEXT NOT NULL
        CHECK (status IN ('active', 'completed')),

    winner_user_id INTEGER REFERENCES users(id),
    final_state JSONB,

    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,

    created TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
