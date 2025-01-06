import inquirer from 'inquirer';
import pg from 'pg';
const {Pool} = pg;

const pool = new Pool({
    host: 'localhost',
    user: 'elianaliantonio',
    password: 'blah',
    database: 'employee_db'
});

function start() {
    pool.connect()
        .then(() => {
            console.log('Connected to the database');

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'View all departments',
                        'View all roles',
                        'View all employees',
                        'Add a department',
                        'Add a role',
                        'Add an employee',
                        'Update an employee role',
                        'Exit'
                    ]
                }
            ]).then((answer) => {
                switch (answer.action) {
                    case 'View all departments':
                        viewAllDepartments();
                        break;
                    case 'View all roles':
                        viewAllRoles();
                        break;
                    case 'View all employees':
                        viewAllEmployees();
                        break;
                    case 'Add a department':
                        addDepartment();
                        break;
                    case 'Add a role':
                        addRole();
                        break;
                    case 'Add an employee':
                        addEmployee();
                        break;
                    case 'Update an employee role':
                        updateEmployeeRole();
                        break;
                    case 'Exit':
                        pool.end();
                        console.log('Disconnected from the database');
                        break;
                }
            });
        })
        .catch(err => console.error('Connection error:', err.stack));
}

function viewAllDepartments() {
    pool.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        console.table(results.rows); 
        start();
    });
}

function viewAllRoles() {
    pool.query('SELECT * FROM role', (err, results) => {
        if (err) {
            console.error('Error viewing roles', err.stack);
            return;
        }
        console.table(results.rows);
        start();
    });
}

function viewAllEmployees() {
    pool.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        console.table(results.rows);
        start();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of the department?'
        }
    ]).then((answer) => {
        pool.query(
            'INSERT INTO department (name) VALUES ($1)',
            [answer.departmentName],
            (err) => {
                if (err) throw err;
                console.log(`The department ${answer.departmentName} has been added!`);
                start();
            }
        );
    });
}

function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'roleTitle',
            message: 'What is the name of the role?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary for this role?'
        },
        {
            type: 'input',
            name: 'departmentId',
            message: 'What is the department ID for this role?' 
        }
    ]).then((answers) => {
        const { roleTitle, salary, departmentId } = answers;
        pool.query(
            'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
            [roleTitle, salary, departmentId],
            (err) => {
                if (err) throw err;
                console.log('Role added successfully');
                start();
            }
        );
    });
}

function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'What is this employee\'s first name?'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'What is this employee\'s last name?'
        },
        {
            type: 'list',
            name: 'role',
            message: 'What is this employee\'s role?',
            choices: [
                'Sales Lead',
                'Salesperson',
                'Lead Engineer',
                'Software Engineer',
                'Account Manager',
                'Accountant',
                'Legal Team Lead',
                'Lawyer'
            ]
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            choices: [
                'None',
                'Mary Ribera',
                'Matthew Zazeski',
                'Thomas Liantonio',
                'Tess Ripepi',
                'Walter White',
                'Jimmy Carter',
                'Mickey Mouse',
                'George Washington',
            ]
        }
    ]).then(({ first_name, last_name, role, manager }) => {
        function mapRoleToId(role) {
            const roleMap = {
                'Sales Lead': 1,
                'Salesperson': 2,
                'Lead Engineer': 3,
                'Software Engineer': 4,
                'Account Manager': 5,
                'Accountant': 6,
                'Legal Team Lead': 7,
                'Lawyer': 8
            };
            return roleMap[role];
        }

        function mapManagerToId(manager) {
            const managerMap = {
                'None': null,
                'Mary Ribera': 1,
                'Thomas Liantonio': 2,
                'Walter White': 3,
                'Mickey Mouse': 4
            };
            return managerMap[manager];
        }

        const roleId = mapRoleToId(role);
        const managerId = mapManagerToId(manager);

        pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
            [first_name, last_name, roleId, managerId],
            (err) => {
                if (err) throw err;
                console.log(`Added ${first_name} ${last_name} to the database`);
                start();
            }
        );
    });
}

function updateEmployeeRole() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'update',
            message: 'Which employee\'s role would you like to update?',
            choices: [
                {name: 'Mary Ribera', value: 1},
                {name: 'Matthew Zazeski', value: 2},
                {name: 'Thomas Liantonio', value: 3},
                {name: 'Tess Ripepi', value: 4},
                {name: 'Walter White', value: 5},
                {name: 'Jimmy Carter', value: 6},
                {name: 'Mickey Mouse', value: 7},
                {name: 'George Washington', value: 8},
            ]
        },
        {
            type: 'list',
            name: 'assignRole',
            message: 'Which role do you want to assign the selected employee?',
            choices: [
                'Sales Lead',
                'Salesperson',
                'Lead Engineer',
                'Software Engineer',
                'Account Manager',
                'Accountant',
                'Legal Team Lead',
                'Lawyer'
            ]
        }
    ]).then(({ update, assignRole }) => {
        const roleId = mapRoleToId(assignRole);

        mapEmployeeToId(update)
            .then(employeeId => {
                pool.query(
                    'UPDATE employee SET role_id = $1 WHERE id = $2',
                    [roleId, employeeId],
                    (err) => {
                        if (err) throw err;
                        console.log('Employee role has been updated!');
                        start();
                    }
                );
            })
            .catch(err => {
                console.error('Error getting employee ID:', err);
            });
    });
}

function mapRoleToId (role) {
    const roleMap = {
        'Sales Lead': 1,
        'Salesperson': 2,
        'Lead Engineer': 3,
        'Software Engineer': 4,
        'Account Manager': 5,
        'Accountant': 6,
        'Legal Team Lead': 7,
        'Lawyer': 8
    };
    return roleMap[role];
}
function mapEmployeeToId(employeeId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id FROM employee WHERE id = $1',
            [employeeId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.rows.length === 0) {
                    reject(new Error(`Employee ${employeeId} not found.`));
                } else {
                    resolve(results.rows[0].id);
                }
            }
        );
    });
}

start();