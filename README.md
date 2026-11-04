
# Onboardly

A full-stack employee onboarding platform for managing employees, onboarding tasks, and progress.

## Features

- Employee management with name, email, and department
- Task management with descriptions, statuses, due dates, and employee assignments
- Dashboard with employee and task statistics
- React frontend integrated with Django REST APIs

## Tech Stack

**Frontend:** React, JavaScript, Vite  
**Backend:** Python, Django, Django REST Framework  
**Database:** SQLite (development)  
**Version Control:** Git, GitHub

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js and npm

### 1. Clone the repository

```bash
git clone git@github.com:kalidaspratheep-glitch/Onboardly.git
cd Onboardly
```

### 2. Set up the backend

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/Scripts/activate  # Git Bash on Windows
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
DJANGO_SECRET_KEY=your-secret-key
```

Generate a secret key with:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Apply database migrations and start Django:

```bash
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000/`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173/`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET, POST | `/api/employees/` | List or create employees |
| GET, PUT, PATCH, DELETE | `/api/employees/<id>/` | Retrieve, update, or delete an employee |
| GET, POST | `/api/tasks/` | List or create tasks |
| GET, PUT, PATCH, DELETE | `/api/tasks/<id>/` | Retrieve, update, or delete a task |

## Project Structure

```text
Onboardly/
├── config/           # Django project configuration
├── employees/        # Employee and task models, serializers, APIs
├── frontend/         # React application
├── manage.py
├── requirements.txt
└── README.md
```

## Project Status

Currently under development. Features and documentation will evolve as the project progresses.