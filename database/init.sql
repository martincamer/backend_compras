CREATE TABLE producto (
    id SERIAL PRIMARY KEY,
    detalle varchar(255),
    categoria varchar(255),
    total_stock numeric,
    precio_und numeric,
    role_id numeric,
    usuario varchar,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


//roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

//rol intro
INSERT INTO roles (name) VALUES ('admin'), ('user');


//alter table
ALTER TABLE users ADD COLUMN role_id INT;

-- Asignar rol "user" por defecto a los usuarios existentes
UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'user');


CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email   VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


ALTER TABLE users ADD COLUMN gravatar VARCHAR(255);

ALTER TABLE empleados ADD COLUMN user_id INTEGER REFERENCES users(id);
