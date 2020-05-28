CREATE TABLE users_table(
    user_id SERIAL PRIMARY KEY, --user id 
    password VARCHAR(500) NOT NULL,
    user_name VARCHAR(40) NOT NULL,  --username
    nick_name VARCHAR(40) NOT NULL -- nickname of user 
);

