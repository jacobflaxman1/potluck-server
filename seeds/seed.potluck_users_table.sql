BEGIN;

INSERT INTO potluck_table (potluck_name) VALUES ('New Potluck Yippe');
INSERT INTO items_table (item_name, potluck_id) VALUES ('test' , 9), ('test2', 9), ('test3', 9);
INSERT INTO potluck_users_table (user_id, potluck_id) VALUES ('23', '9');

COMMIT;