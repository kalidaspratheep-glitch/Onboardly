import { useEffect, useState } from "react";

function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([])
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    due_date: "",
    employee: "",
  });
  const [taskFormError, setTaskFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [formError, setFormError] = useState("");
  const [activePage, setActivePage] = useState("overview"); //state handling for sidebar
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFilter, setTaskFilter] = useState("All");
  const filteredTasks =
    taskFilter === "All"
      ? tasks
      : tasks.filter((task) => task.status === taskFilter);

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

  function closeEmployeeForm() {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
    setFormError("");
  }

  async function handleEmployeeSubmit(event) {
    event.preventDefault();
    setFormError("");

    const isEditing = editingEmployee !== null;

    const url = isEditing
      ? `http://127.0.0.1:8000/api/employees/${editingEmployee.id}/`
      : "http://127.0.0.1:8000/api/employees/";

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "Unable to save employee.";

        throw new Error(message);
      }

      if (isEditing) {
        setEmployees((currentEmployees) =>
          currentEmployees.map((employee) =>
            employee.id === editingEmployee.id ? data : employee
          )
        );
      } else {
        setEmployees((currentEmployees) => [...currentEmployees, data]);
      }

      closeEmployeeForm();
      setEditingEmployee(null);
    } catch (error) {
      setFormError(error.message);
    }
  }

  function handleEditEmployee(employee) { //will just reopen the add employee form with data filled in
    setEditingEmployee(employee);

    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
    });

    setFormError("");
    setShowEmployeeForm(true);
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    setTaskFormError("");

    const isEditing = editingTask !== null;

    const url = isEditing
      ? `http://127.0.0.1:8000/api/tasks/${editingTask.id}/`
      : "http://127.0.0.1:8000/api/tasks/";

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskFormData,
          employee: Number(taskFormData.employee),
          due_date: taskFormData.due_date || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "Unable to save task.";

        throw new Error(message);
      }

      if (isEditing) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTask.id ? data : task
          )
        );
      } else {
        setTasks((currentTasks) => [...currentTasks, data]);
      }

      closeTaskForm();
    } catch (error) {
      setTaskFormError(error.message);
    }
  }

  function closeTaskForm() {
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskFormError("");

    setTaskFormData({
      title: "",
      description: "",
      status: "Pending",
      due_date: "",
      employee: "",
    });
  }

  function handleEditTask(task) {
    setEditingTask(task);

    setTaskFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date || "",
      employee: String(task.employee),
    });

    setTaskFormError("");
    setShowTaskForm(true);
  }

  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tasks/${taskId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete task.");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDeleteEmployee(employeeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/employees/${employeeId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete employee.");
      }

      setEmployees((currentEmployees) =>
        currentEmployees.filter(
          (employee) => employee.id !== employeeId
        )
      );

    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.message);
    }
  }

  function isTaskOverdue(task) {
    if (!task.due_date || task.status === "Completed") {
      return false;
    }

    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    return task.due_date < todayString;
  }

  function getEmployeeProgress(employeeId) {
    const employeeTasks = tasks.filter(
      (task) => task.employee === employeeId
    );

    const total = employeeTasks.length;

    const completed = employeeTasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const percentage = total === 0
      ? 0
      : Math.round((completed / total) * 100);

    return { total, completed, percentage };
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
          {activePage === "employees" && (
            <button
              className="add-button"
              onClick={() => setShowEmployeeForm(true)}
            >
              + Add Employee
            </button>
          )}
          {activePage === "tasks" && (
            <button
              className="add-button"
              onClick={() => setShowTaskForm(true)}
            >
              + Add Task
            </button>
          )}
        </header>
        {showEmployeeForm && (
          <div className="form-section">
            <div className="form-header">
              <h2>{editingEmployee ? "Edit Employee" : "Add Employee"}</h2>

              <button
                type="button"
                className="close-button"
                onClick={() => closeEmployeeForm()}
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
                  onClick={() => closeEmployeeForm()}>
                  Cancel
                </button>

                <button type="submit" className="save-button">
                  {editingEmployee ? "Update Employee" : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        )}

        {showTaskForm && (
          <div className="form-section">
            <div className="form-header">
              <h2>{editingTask ? "Edit Task" : "Add Task"}</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => closeTaskForm()}
                aria-label="Close form"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTaskSubmit}>
              <div className="form-field">
                <label htmlFor="task-title">Task Title</label>
                <input
                  id="task-title"
                  type="text"
                  value={taskFormData.title}
                  onChange={(event) =>
                    setTaskFormData({
                      ...taskFormData,
                      title: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  value={taskFormData.description}
                  onChange={(event) =>
                    setTaskFormData({
                      ...taskFormData,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="task-employee">Assign Employee</label>
                <select
                  id="task-employee"
                  value={taskFormData.employee}
                  onChange={(event) =>
                    setTaskFormData({
                      ...taskFormData,
                      employee: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="task-due-date">Due Date</label>
                <input
                  id="task-due-date"
                  type="date"
                  value={taskFormData.due_date}
                  onChange={(event) =>
                    setTaskFormData({
                      ...taskFormData,
                      due_date: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  value={taskFormData.status}
                  onChange={(event) =>
                    setTaskFormData({
                      ...taskFormData,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {taskFormError && (
                <p className="error-message">{taskFormError}</p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => closeTaskForm()}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {editingTask ? "Update Task" : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        )}


        {/*OVERVIEW PAGE*/}
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

        {/* EMPLOYEES PAGE */}
        {activePage === "employees" && (
          <section className="tasks-section">
            <div className="section-heading">
              <h2>Employees</h2>
            </div>

            {employees.map((employee) => {
              const progress = getEmployeeProgress(employee.id);

              return (
                <div className="task-row employee-row" key={employee.id}>
                  <div className="task-info">
                    <h3>{employee.name}</h3>
                    <p>{employee.email} · {employee.department}</p>
                  </div>

                  <div className="employee-progress">
                    <div className="progress-details">
                      <span>
                        {progress.completed} / {progress.total} tasks completed
                      </span>
                      <span>{progress.percentage}%</span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="employee-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/*TASKS PAGE*/}
        {(activePage === "tasks" || activePage === "overview") && (
          <section className="tasks-section">
            <div className="section-heading">
              <h2>Recent Tasks</h2>
              <a href="#">View all</a>
            </div>

            {activePage === "tasks" && (
              <div className="task-filters">
                {["All", "Pending", "In Progress", "Completed"].map((filter) => (
                  <button
                    key={filter}
                    className={taskFilter === filter ? "filter-button active" : "filter-button"}
                    onClick={() => setTaskFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            <div className="task-list">
              {(activePage === "tasks" ? filteredTasks : tasks).map((task) => {
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
                      {isTaskOverdue(task) && (
                        <span className="overdue-label">Overdue</span>
                      )}
                    </div>

                    <div className="employee-actions">
                      <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
                        {task.status}
                      </span>

                      <div className="task-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
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