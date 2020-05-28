
CREATE TABLE potluck_users_link(
    potluck_users_link_id SERIAL PRIMARY KEY,
    guest_user INTEGER REFERENCES users_table(user_id) ON DELETE CASCADE,
    potluck_id INTEGER REFERENCES potluck_table(potluck_id) ON DELETE CASCADE
);