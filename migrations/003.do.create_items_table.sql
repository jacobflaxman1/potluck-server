
CREATE TABLE items_table(
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(60) NOT NULL,
    taken BOOLEAN DEFAULT false, 
    taken_by INTEGER REFERENCES users_table(user_id) ON DELETE CASCADE,
    potluck_id INTEGER REFERENCES potluck_table(potluck_id) ON DELETE CASCADE
);
