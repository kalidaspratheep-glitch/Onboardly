
# Onboardly

A full-stack employee onboarding platform built to simplify employee management, automate onboarding workflows, and track task completion.

## Features

### Employee Management
- Create, view, update, and delete employee records.
- Store employee information including name, email, and department.
- Enforce unique email addresses.
- Assign onboarding workflows when creating employees.

### Task Management
- Create, view, update, and delete onboarding tasks.
- Assign tasks to employees with descriptions and due dates.
- Track task statuses: Pending, In Progress, and Completed.
- Filter tasks by status.
- Automatically identify overdue tasks.

### Onboarding Workflows
- Create reusable onboarding workflow templates.
- Define workflow tasks with configurable due dates and execution order.
- Apply workflows to employees to automatically generate their onboarding tasks.
- Prevent duplicate workflow assignments to the same employee.
- Calculate task due dates relative to the employee's onboarding start date.

### Dashboard
- View employee and task statistics.
- Track individual employee onboarding progress.
- Monitor completed, pending, and overdue tasks.
- Navigate between employee, task, and workflow management sections.

### Backend and Data Integrity
- RESTful APIs built with Django REST Framework.
- Relational data models with foreign key relationships.
- Backend validation for employee emails and task statuses.
- Database transactions to ensure workflow assignments are completed atomically.
- Automated API tests covering employee creation, task creation, workflow assignment, duplicate prevention, and cascading deletion.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| API | REST |
| Testing | Django REST Framework APITestCase |
| Version Control | Git, GitHub |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js and npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone git@github.com:kalidaspratheep-glitch/Onboardly.git
cd Onboardly
```

### 2. Set up PostgreSQL

Create a database and a dedicated database user.

Connect to PostgreSQL:

```bash
psql -U postgres -h localhost
```

Create the database and user:

```sql
CREATE DATABASE onboardly;

CREATE ROLE onboardly_user WITH LOGIN PASSWORD 'your-password';

ALTER DATABASE onboardly OWNER TO onboardly_user;
```

Exit PostgreSQL:

```sql
\q
```

### 3. Set up the backend

Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows (Git Bash / MSYS2):

```bash
source .venv/Scripts/activate
```

On macOS / Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
DJANGO_SECRET_KEY=your-secret-key

DB_NAME=onboardly
DB_USER=onboardly_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

Generate a Django secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Use the generated value for `DJANGO_SECRET_KEY`.

Apply database migrations:

```bash
python manage.py migrate
```

Create an admin account:

```bash
python manage.py createsuperuser
```

Start the Django development server:

```bash
python manage.py runserver
```

Backend runs at:

http://127.0.0.1:8000/

Django Admin:

http://127.0.0.1:8000/admin/

### 4. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

http://localhost:5173/

### 5. Run automated tests

From the project root:

```bash
python manage.py test employees
```

The test suite uses a separate temporary database and verifies core employee, task, and workflow API functionality.

For PostgreSQL testing, the database user must have permission to create databases:

```sql
ALTER ROLE onboardly_user CREATEDB;
```

## API Endpoints

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET, POST | `/api/employees/` | List or create employees |
| GET, PUT, PATCH, DELETE | `/api/employees/<id>/` | Retrieve, update, or delete an employee |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET, POST | `/api/tasks/` | List or create tasks |
| GET, PUT, PATCH, DELETE | `/api/tasks/<id>/` | Retrieve, update, or delete a task |

### Workflows

| Method | Endpoint | Description |
|---|---|---|
| GET, POST | `/api/workflows/` | List or create workflow templates |
| POST | `/api/workflows/<workflow_id>/apply/` | Apply a workflow to an employee and generate tasks |

## Project Structure

```text
Onboardly/
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── employees/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Workflows.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
├── .gitignore
├── manage.py
├── requirements.txt
└── README.md
```

## Project Status

Core employee management, task management, reusable onboarding workflows, PostgreSQL integration, and automated backend tests have been implemented.

Deployment and further improvements are planned.