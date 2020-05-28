CREATE TABLE potluck_table(
    potluck_name VARCHAR(60),
    potluck_id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE,
    admin_user INTEGER REFERENCES users_table(user_id) ON DELETE CASCADE
);
