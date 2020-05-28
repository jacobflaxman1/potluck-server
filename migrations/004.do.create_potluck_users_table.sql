CREATE TABLE potluck_users_table(
    potluck_users_id SERIAL PRIMARY KEY,
    potluck_id INTEGER REFERENCES potluck_table(potluck_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users_table(user_id),
    item_id INTEGER REFERENCES items_table(item_id), 
    UNIQUE(potluck_id, user_id, item_id)
);  