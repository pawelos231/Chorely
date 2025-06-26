-- Clear existing data
TRUNCATE TABLE users, households, household_members, tasks, comments, task_history RESTART IDENTITY CASCADE;

-- Seed users
INSERT INTO users (id, name, email, password_hash, avatar) VALUES
(1, 'Alice', 'alice@example.com', '$2b$10$fVf2w2F.pDZ..p3nD3OINOSALy1Jg/3aRERvjAZDUDq6e4iBGuR8m', 'https://i.pravatar.cc/150?u=alice'), -- password is "password"
(2, 'Bob', 'bob@example.com', '$2b$10$fVf2w2F.pDZ..p3nD3OINOSALy1Jg/3aRERvjAZDUDq6e4iBGuR8m', 'https://i.pravatar.cc/150?u=bob'), -- password is "password"
(3, 'Charlie', 'charlie@example.com', '$2b$10$fVf2w2F.pDZ..p3nD3OINOSALy1Jg/3aRERvjAZDUDq6e4iBGuR8m', 'https://i.pravatar.cc/150?u=charlie'),
(4, 'Diana', 'diana@example.com', '$2b$10$fVf2w2F.pDZ..p3nD3OINOSALy1Jg/3aRERvjAZDUDq6e4iBGuR8m', 'https://i.pravatar.cc/150?u=diana'),
(5, 'Evan', 'evan@example.com', '$2b$10$fVf2w2F.pDZ..p3nD3OINOSALy1Jg/3aRERvjAZDUDq6e4iBGuR8m', 'https://i.pravatar.cc/150?u=evan'),
(6, 'Fiona', 'fiona@example.com', '$2b$10$fVf2w2F.pDZ..p3nD3OINOSALy1Jg/3aRERvjAZDUDq6e4iBGuR8m', 'https://i.pravatar.cc/150?u=fiona');

-- Seed households
INSERT INTO households (id, name, description, number_of_rooms, house_size, number_of_floors, has_garden, has_garage, has_basement, has_attic) VALUES
(1, 'The Fun House', 'A lively place with lots of activities.', 5, 200, 2, true, true, false, true),
(2, 'The Quiet Corner', 'A calm and peaceful residence for focused individuals.', 3, 120, 1, false, true, true, false),
(3, 'Maple Street Manor', 'A classic suburban home with a big yard.', 8, 350, 3, true, true, true, true),
(4, 'Downtown Loft', 'A modern, open-concept apartment in the heart of the city.', 2, 90, 1, false, false, false, false);

-- Seed household_members
-- The Fun House (Alice: Admin, Bob: Member, Diana: Member)
INSERT INTO household_members (household_id, user_id, role) VALUES
(1, 1, 'admin'),
(1, 2, 'member'),
(1, 4, 'member');
-- The Quiet Corner (Alice: Member, Charlie: Admin)
INSERT INTO household_members (household_id, user_id, role) VALUES
(2, 1, 'member'),
(2, 3, 'admin');
-- Maple Street Manor (Evan: Admin, Fiona: Member, Diana: Member)
INSERT INTO household_members (household_id, user_id, role) VALUES
(3, 5, 'admin'),
(3, 6, 'member'),
(3, 4, 'member');
-- Downtown Loft (Bob: Admin)
INSERT INTO household_members (household_id, user_id, role) VALUES
(4, 2, 'admin');

-- Seed tasks for The Fun House (household_id = 1)
INSERT INTO tasks (title, description, assigned_to, household_id, due_date, status, priority, category) VALUES
('Plan weekend BBQ', 'Coordinate with everyone on what to bring. Main course is burgers.', 1, 1, NOW() + INTERVAL '3 days', 'To Do', 'high', 'Shopping'),
('Clean the living room', 'Vacuum, dust, and tidy up before guests arrive.', 2, 1, NOW() + INTERVAL '1 day', 'In Progress', 'medium', 'Cleaning'),
('Mow the lawn', 'Front and back yards. Watch out for the sprinklers.', 4, 1, NOW() + INTERVAL '2 days', 'To Do', 'medium', 'Yard Work'),
('Fix the leaky faucet', 'In the upstairs bathroom. The wrench is in the garage.', 1, 1, NOW() + INTERVAL '5 days', 'Done', 'low', 'Maintenance');

-- Seed tasks for The Quiet Corner (household_id = 2)
INSERT INTO tasks (title, description, assigned_to, household_id, due_date, status, priority, category) VALUES
('Organize the library', 'Sort books by genre and author.', 3, 2, NOW() + INTERVAL '1 week', 'To Do', 'medium', 'Cleaning'),
('Pay the internet bill', 'Due by the end of the month. Find the bill on the fridge.', 1, 2, NOW() + INTERVAL '10 days', 'Done', 'high', 'Bills'),
('Deep clean the kitchen', 'Wipe down all surfaces, clean the oven and microwave.', 3, 2, NOW() + INTERVAL '4 days', 'In Progress', 'high', 'Cleaning');

-- Seed tasks for Maple Street Manor (household_id = 3)
INSERT INTO tasks (title, description, assigned_to, household_id, due_date, status, priority, category) VALUES
('Garden weeding', 'Focus on the rose bushes and the vegetable patch.', 6, 3, NOW() + INTERVAL '2 days', 'To Do', 'low', 'Yard Work'),
('Paint the guest room', 'Color is "Serene Blue". Paint and brushes are in the basement.', 5, 3, NOW() + INTERVAL '2 weeks', 'To Do', 'medium', 'Maintenance'),
('Weekly grocery run', 'Get milk, bread, eggs, and snacks for the week.', 4, 3, NOW() + INTERVAL '1 day', 'Done', 'high', 'Shopping'),
('Clean out the garage', 'Create a pile for donation and one for trash.', 5, 3, NOW() + INTERVAL '3 weeks', 'To Do', 'medium', 'Cleaning');

-- Seed tasks for Downtown Loft (household_id = 4)
INSERT INTO tasks (title, description, assigned_to, household_id, due_date, status, priority, category) VALUES
('Assemble new bookshelf', 'Instructions are in the box. Tools are in the kitchen drawer.', 2, 4, NOW() + INTERVAL '1 day', 'In Progress', 'high', 'Maintenance'),
('Cook dinner for tonight', 'Pasta with pesto sauce. Ingredients are in the pantry.', 2, 4, NOW(), 'To Do', 'high', 'Cooking');

-- Seed comments
INSERT INTO comments (task_id, user_id, content) VALUES
-- Comments for task 1 (BBQ)
(1, 2, 'I can bring chips and dip!'),
(1, 4, 'I''ll handle the sodas and ice.'),
(1, 1, 'Great! I''ll get the burger patties and buns then.'),
-- Comments for task 2 (Living Room)
(2, 1, 'Can you also wipe down the windowsills?'),
(2, 2, 'Sure thing, will do.'),
-- Comments for task 6 (Internet Bill)
(6, 3, 'Thanks for taking care of this, I almost forgot!'),
(6, 1, 'No problem! Already paid.');

-- Seed task_history
-- History for task 2 (Living Room)
INSERT INTO task_history (task_id, changed_by, old_status, new_status, change_description) VALUES
(2, 2, 'To Do', 'In Progress', 'Bob started cleaning the living room.');
-- History for task 4 (Leaky Faucet)
INSERT INTO task_history (task_id, changed_by, old_status, new_status, change_description) VALUES
(4, 1, 'To Do', 'In Progress', 'Alice started to look for the wrench.'),
(4, 1, 'In Progress', 'Done', 'Alice fixed the faucet and tested it.');
-- History for task 6 (Internet Bill)
INSERT INTO task_history (task_id, changed_by, old_status, new_status, change_description) VALUES
(6, 1, 'To Do', 'Done', 'Alice paid the bill online.');
-- History for task 10 (Grocery Run)
INSERT INTO task_history (task_id, changed_by, old_status, new_status, change_description) VALUES
(10, 4, 'To Do', 'Done', 'Diana completed the shopping.');
-- History for task 12 (Bookshelf)
INSERT INTO task_history (task_id, changed_by, old_status, new_status, change_description) VALUES
(12, 2, 'To Do', 'In Progress', 'Bob has unpacked the bookshelf parts.'); 