INSERT INTO department (name) VALUES
       ('Sales'),
       ('Engineering'),
       ('Finance'),
       ('Legal');

INSERT INTO role (title, salary, department_id) VALUES 
       ('Sales Lead', 100000, 1),
       ('Salesperson', 80000, 1),
       ('Lead Engineer', 150000, 2),
       ('Software Engineer', 120000, 2),
       ('Account Manager', 160000, 3),
       ('Accountant', 125000, 3),
       ('Legal Team Lead', 250000, 4),
       ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
       ('Mary', 'Ribera', 1, NULL),
       ('Matthew', 'Zazeski', 2, 1),
       ('Thomas', 'Liantonio', 3, NULL),
       ('Tess', 'Ripepi', 4, 3),
       ('Walter','White', 5, NULL),
       ('Jimmy', 'Carter', 6, 5),
       ('Mickey', 'Mouse', 7, NULL),
       ('George','Washington', 8, 7);