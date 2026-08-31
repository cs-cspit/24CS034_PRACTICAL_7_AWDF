import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all tasks from Express + MongoDB backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title,
          description: description,
          completed: false
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      const data = await response.json();
      setTasks((prevTasks) => [...prevTasks, data.task]);
      setTitle("");
      setDescription("");
      setMessage("Task created successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update existing task
  const updateTask = async (task) => {
    const newTitle = window.prompt("Enter new task title:", task.title);
    if (!newTitle || !newTitle.trim()) {
      return;
    }
    const newDescription = window.prompt(
      "Enter new description:",
      task.description || ""
    );
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          completed: task.completed
        })
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      const data = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((item) => (item._id === task._id ? data.task : item))
      );
      setMessage("Task updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task with confirmation
  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmed) {
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      setMessage("Task deleted successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Task Manager</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      {loading && <p>Loading...</p>}

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      <h2>Tasks</h2>
      {tasks.length === 0 && !loading ? (
        <p>No tasks available</p>
      ) : (
        tasks.map((task) => (
          <div className="task" key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.completed ? "Completed" : "Pending"}</p>
            <button onClick={() => updateTask(task)}>Update</button>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
