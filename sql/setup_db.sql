CREATE TABLE IF NOT EXISTS user_account (
    id              SERIAL              NOT NULL PRIMARY KEY,
    login           TEXT                NOT NULL UNIQUE,
    email           TEXT                NOT NULL,
    password        TEXT                NOT NULL
);

CREATE TABLE IF NOT EXISTS match (
    id              SERIAL              NOT NULL PRIMARY KEY,
    begin_time      TIMESTAMP           NOT NULL DEFAULT NOW(),
    pgn             TEXT                NOT NULL
);

CREATE TABLE IF NOT EXISTS user_match (
    user_id         SERIAL              NOT NULL REFERENCES user_account(id),
    match_id        SERIAL              NOT NULL REFERENCES match(id)
);
