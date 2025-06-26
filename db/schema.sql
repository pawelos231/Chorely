CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    number_of_rooms INTEGER,
    house_size INTEGER,
    number_of_floors INTEGER,
    address VARCHAR(255),
    house_type VARCHAR(50),
    has_garden BOOLEAN DEFAULT false,
    has_garage BOOLEAN DEFAULT false,
    has_basement BOOLEAN DEFAULT false,
    has_attic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE household_members (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES users(id),
    household_id INTEGER NOT NULL REFERENCES households(id),
    due_date DATE,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_history (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    changed_by INTEGER NOT NULL REFERENCES users(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    change_description TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 