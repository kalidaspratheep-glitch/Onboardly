import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://127.0.0.1:8000/api/workflows/";

const emptyTask = {
  title: "",
  description: "",
  days_after_start: "0",
};

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([{ ...emptyTask }]);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function fetchWorkflows() {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to fetch workflows.");
      }

      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkflows();
  }, []);

  function addTask() {
    setTasks((currentTasks) => [
      ...currentTasks,
      { ...emptyTask },
    ]);
  }

  function removeTask(index) {
    setTasks((currentTasks) =>
      currentTasks.filter((_, taskIndex) => taskIndex !== index)
    );
  }

  function updateTask(index, field, value) {
    setTasks((currentTasks) =>
      currentTasks.map((task, taskIndex) =>
        taskIndex === index
          ? { ...task, [field]: value }
          : task
      )
    );
  }

  function resetForm() {
    setName("");
    setDescription("");
    setTasks([{ ...emptyTask }]);
    setFormError("");
  }

  function closeForm() {
    if (isSaving) return;

    setShowForm(false);
    resetForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const payload = {
      name: name.trim(),
      description: description.trim(),
      tasks: tasks.map((task) => ({
        title: task.title.trim(),
        description: task.description.trim(),
        days_after_start: Number(task.days_after_start),
      })),
    };

    try {
      setIsSaving(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create workflow."
        );
      }

      // Add the newly created workflow to the displayed list.
      setWorkflows((currentWorkflows) => [
        ...currentWorkflows,
        data,
      ]);

      setShowForm(false);
      resetForm();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content workflow-page">
        <div className="topbar workflow-topbar">
          <div>
            <h1>Workflow Templates</h1>
            <p>
              Create and manage reusable employee onboarding workflows.
            </p>
          </div>

          <button
            className="add-button"
            onClick={() => {
              setFormError("");
              setShowForm(true);
            }}
          >
            + Create Workflow
          </button>
        </div>

        {showForm && (
          <section className="workflow-form-card">
            <div className="workflow-form-heading">
              <div>
                <h2>Create a Workflow</h2>
                <p>
                  Define a reusable set of tasks for new employees.
                </p>
              </div>

              <button
                type="button"
                className="close-form-button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form
              className="workflow-form"
              onSubmit={handleSubmit}
            >
              <div className="workflow-field">
                <label htmlFor="workflow-name">
                  Workflow Name
                </label>
                <input
                  id="workflow-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Engineering Onboarding"
                  required
                />
              </div>

              <div className="workflow-field">
                <label htmlFor="workflow-description">
                  Description
                </label>
                <textarea
                  id="workflow-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe what this workflow is for..."
                  rows="3"
                />
              </div>

              <div className="workflow-tasks-heading">
                <div>
                  <h3>Workflow Tasks</h3>
                  <p>
                    Add the tasks employees should complete.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addTask}
                >
                  + Add Task
                </button>
              </div>

              <div className="workflow-task-form-list">
                {tasks.map((task, index) => (
                  <div
                    className="workflow-task-form-card"
                    key={index}
                  >
                    <div className="workflow-task-form-top">
                      <h4>Task {index + 1}</h4>

                      {tasks.length > 1 && (
                        <button
                          type="button"
                          className="remove-task-button"
                          onClick={() => removeTask(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="workflow-field">
                      <label htmlFor={`task-title-${index}`}>
                        Task Title
                      </label>
                      <input
                        id={`task-title-${index}`}
                        type="text"
                        value={task.title}
                        onChange={(event) =>
                          updateTask(index, "title", event.target.value)
                        }
                        placeholder="e.g. Set up company laptop"
                        required
                      />
                    </div>

                    <div className="workflow-field">
                      <label htmlFor={`task-description-${index}`}>
                        Task Description
                      </label>
                      <textarea
                        id={`task-description-${index}`}
                        value={task.description}
                        onChange={(event) =>
                          updateTask(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Add instructions for this task..."
                        rows="2"
                      />
                    </div>

                    <div className="workflow-field workflow-days-field">
                      <label htmlFor={`task-days-${index}`}>
                        Due After Start Date
                      </label>
                      <div className="workflow-days-input">
                        <input
                          id={`task-days-${index}`}
                          type="number"
                          min="0"
                          step="1"
                          value={task.days_after_start}
                          onChange={(event) =>
                            updateTask(
                              index,
                              "days_after_start",
                              event.target.value
                            )
                          }
                          required
                        />
                        <span>days</span>
                      </div>
                      <small>
                        0 means the task is due on the employee's start date.
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              {formError && (
                <p className="error-message">{formError}</p>
              )}

              <div className="workflow-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Creating..." : "Create Workflow"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="workflow-list-section">
          <div className="workflow-list-heading">
            <h2>Your Workflows</h2>
            <span>
              {workflows.length}{" "}
              {workflows.length === 1 ? "template" : "templates"}
            </span>
          </div>

          {isLoading && (
            <p className="workflow-message">Loading workflows...</p>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

          {!isLoading && !error && workflows.length === 0 && (
            <div className="workflow-empty-state">
              <h3>No workflows yet</h3>
              <p>
                Create your first workflow to define a reusable
                onboarding process.
              </p>
              <button
                className="add-button"
                onClick={() => setShowForm(true)}
              >
                + Create Your First Workflow
              </button>
            </div>
          )}

          {!isLoading && !error && workflows.length > 0 && (
            <div className="workflow-grid">
              {workflows.map((workflow) => (
                <article
                  className="workflow-card"
                  key={workflow.id}
                >
                  <div className="workflow-card-top">
                    <div className="workflow-card-icon">
                      W
                    </div>
                    <span className="workflow-task-count">
                      {workflow.tasks.length}{" "}
                      {workflow.tasks.length === 1 ? "task" : "tasks"}
                    </span>
                  </div>

                  <h3>{workflow.name}</h3>

                  <p className="workflow-card-description">
                    {workflow.description ||
                      "No description provided."}
                  </p>

                  <div className="workflow-card-divider" />

                  <h4>Tasks included</h4>

                  {workflow.tasks.length > 0 ? (
                    <ul className="workflow-card-task-list">
                      {workflow.tasks.map((task) => (
                        <li key={task.id}>
                          <span className="workflow-task-dot" />
                          <span>{task.title}</span>
                          <small>
                            Day {task.days_after_start}
                          </small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="workflow-card-description">
                      No tasks in this workflow.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Workflows;