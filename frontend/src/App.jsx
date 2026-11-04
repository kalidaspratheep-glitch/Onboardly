import { useEffect, useState } from "react";

function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([])
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [formError, setFormError] = useState("");
  const [activePage, setActivePage] = useState("overview"); //state handling for sidebar

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        return response.json();
      })
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error:", error));

    fetch("http://127.0.0.1:8000/api/tasks/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return response.json();
      })
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error))
  }, []);

  async function handleEmployeeSubmit(event) {
    event.preventDefault();

    setFormError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/employees/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setEmployees((currentEmployees) => [...currentEmployees, data]);

      setFormData({
        name: "",
        email: "",
        department: "",
      });

      setShowEmployeeForm(false);
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">Onboardly</h2>

        <nav>
          <button
            className={`nav-link ${activePage === "overview" ? "active" : ""}`}
            onClick={() => setActivePage("overview")}
          >
            Overview
          </button>

          <button
            className={`nav-link ${activePage === "employees" ? "active" : ""}`}
            onClick={() => setActivePage("employees")}
          >
            Employees
          </button>

          <button
            className={`nav-link ${activePage === "tasks" ? "active" : ""}`}
            onClick={() => setActivePage("tasks")}
          >
            Tasks
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>
              {activePage === "overview"
                ? "Overview"
                : activePage === "employees"
                  ? "Employees"
                  : "Tasks"}
            </h1>
            <p>Welcome back! Here's what's happening.</p>
          </div>
          <button
            className="add-button"
            onClick={() => setShowEmployeeForm(true)}
          >
            + Add Employee
          </button>
        </header>
        {showEmployeeForm && (
          <div className="form-section">
            <div className="form-header">
              <h2>Add Employee</h2>

              <button
                type="button"
                className="close-button"
                onClick={() => setShowEmployeeForm(false)}
                aria-label="Close form"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit}>
              <div className="form-field">
                <label htmlFor="employee-name">Employee Name</label>
                <input
                  id="employee-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="employee-email">Email Address</label>
                <input
                  id="employee-email"
                  type="email"
                  placeholder="e.g. rahul@company.com"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="employee-department">Department</label>
                <input
                  id="employee-department"
                  type="text"
                  placeholder="e.g. Engineering"
                  value={formData.department}
                  onChange={(event) =>
                    setFormData({ ...formData, department: event.target.value })
                  }
                  required
                />
              </div>

              {formError && <p className="error-message">{formError}</p>}

              <div className="form-actions">
                <button type="button" className="cancel-button"
                  onClick={() => setShowEmployeeForm(false)}>
                  Cancel
                </button>

                <button type="submit" className="save-button">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        )}

        {activePage === "overview" && (
          <section className="stats">
            <div className="stat-card">
              <p>Total Employees</p>
              <h2>{employees.length}</h2>
            </div>

            <div className="stat-card">
              <p>Pending Tasks</p>
              <h2>{tasks.filter((task) => task.status === "Pending").length}</h2>
            </div>

            <div className="stat-card">
              <p>Completed Tasks</p>
              <h2>{tasks.filter((task) => task.status === "Completed").length}</h2>
            </div>

            <div className="stat-card">
              <p>In Progress</p>
              <h2>{tasks.filter((task) => task.status === "In Progress").length}</h2>
            </div>
          </section>
        )}

        {activePage === "employees" && (
          <section className="tasks-section">
            <div className="section-heading">
              <h2>Employees</h2>
            </div>

            {employees.map((employee) => (
              <div className="task-row" key={employee.id}>
                <div className="task-info">
                  <h3>{employee.name}</h3>
                  <p>{employee.email} · {employee.department}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {(activePage === "tasks" || activePage == "overview") && (
          <section className="tasks-section">
            <div className="section-heading">
              <h2>Recent Tasks</h2>
              <a href="#">View all</a>
            </div>

            <div className="task-list">
              {tasks.map((task) => {
                const employee = employees.find(
                  (employee) => employee.id === task.employee
                );

                return (
                  <div className="task-row" key={task.id}>
                    <div className="task-info">
                      <h3>{task.title}</h3>
                      <p>
                        {employee ? employee.name : `Employee #${task.employee}`} · Due {task.due_date}
                      </p>
                    </div>

                    <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
                      {task.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default App;