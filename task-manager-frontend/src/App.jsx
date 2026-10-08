import { useEffect, useState, useCallback } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

/* ── Minimal SVG Icons (Self-contained, accessible, no external font) ── */
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconLogOut = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────── */

function App() {
  // Authentication state
  const [token, setToken] = useState(() => localStorage.getItem("tm_auth_token") || "");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Task list state
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'
  const [loading, setLoading] = useState(false);

  // Edit task modal state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Notification banners
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error' | 'info', text: string }
  const [copiedToken, setCopiedToken] = useState(false);

  const showNotice = (text, type = "info") => {
    setNotice({ text, type });
  };

  // Auto-dismiss notification after 4.5 seconds
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  /* ── 401 Expiry Handler ── */
  const handleAuthExpired = useCallback((customMsg) => {
    localStorage.removeItem("tm_auth_token");
    setToken("");
    setUser(null);
    setTasks([]);
    setAuthMode("login");
    showNotice(customMsg || "Session expired (401). Please sign in again.", "error");
  }, []);

  /* ── Authenticated HTTP Fetch Wrapper ── */
  const authFetch = useCallback(
    async (endpoint, options = {}) => {
      const activeToken = token || localStorage.getItem("tm_auth_token");
      const headers = {
        "Content-Type": "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...options.headers,
      };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized (Token expired or missing)
      if (res.status === 401) {
        const errorData = await res.json().catch(() => ({}));
        handleAuthExpired(errorData.message || "Session expired (401). Redirecting to login...");
        throw new Error(errorData.message || "Unauthorized (401)");
      }

      return res;
    },
    [token, handleAuthExpired]
  );

  /* ── Fetch Logged-In User Details (/me Supplementary Requirement) ── */
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await authFetch("/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // 401 is handled automatically inside authFetch
    }
  }, [authFetch]);

  /* ── Fetch Tasks for Authenticated User ── */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch("/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      if (!err.message.includes("401")) {
        showNotice(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Load user profile & tasks when token changes or on mount
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchTasks();
    } else {
      setUser(null);
      setTasks([]);
    }
  }, [token, fetchUserProfile, fetchTasks]);

  /* ── Register Handler ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      showNotice("Please provide both email and password.", "error");
      return;
    }
    try {
      setAuthSubmitting(true);
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("tm_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
      showNotice("Account created and logged in successfully!", "success");
    } catch (err) {
      showNotice(err.message, "error");
    } finally {
      setAuthSubmitting(false);
    }
  };

  /* ── Login Handler ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      showNotice("Please enter your email and password.", "error");
      return;
    }
    try {
      setAuthSubmitting(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail.trim(),
          password: authPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("tm_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthEmail("");
      setAuthPassword("");
      showNotice("Signed in successfully.", "success");
    } catch (err) {
      showNotice(err.message, "error");
    } finally {
      setAuthSubmitting(false);
    }
  };

  /* ── Logout Handler ── */
  const handleLogout = () => {
    localStorage.removeItem("tm_auth_token");
    setToken("");
    setUser(null);
    setTasks([]);
    showNotice("Signed out successfully.", "info");
  };

  /* ── Add Task with Server-side Validation ── */
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          completed: false,
        }),
      });

      const data = await res.json();

      // Check if server-side validation rejected the request
      if (!res.ok) {
        showNotice(data.message || "Failed to create task", "error");
        return;
      }

      setTasks((prev) => [data.task, ...prev]);
      setTitle("");
      setDescription("");
      showNotice("Task added successfully.", "success");
    } catch (err) {
      if (!err.message.includes("401")) {
        showNotice(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Toggle Completion Status ── */
  const handleToggleComplete = async (task) => {
    try {
      const res = await authFetch(`/tasks/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!res.ok) {
        const data = await res.json();
        showNotice(data.message || "Failed to update status", "error");
        return;
      }
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: !t.completed } : t))
      );
    } catch (err) {
      if (!err.message.includes("401")) showNotice(err.message, "error");
    }
  };

  /* ── Save Edited Task ── */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const res = await authFetch(`/tasks/${editingTask._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice(data.message || "Failed to update task", "error");
        return;
      }
      setTasks((prev) =>
        prev.map((t) => (t._id === editingTask._id ? data.task : t))
      );
      setEditingTask(null);
      showNotice("Task updated.", "success");
    } catch (err) {
      if (!err.message.includes("401")) showNotice(err.message, "error");
    }
  };

  /* ── Delete Task ── */
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await authFetch(`/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showNotice(data.message || "Failed to delete task", "error");
        return;
      }
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      showNotice("Task deleted.", "info");
    } catch (err) {
      if (!err.message.includes("401")) showNotice(err.message, "error");
    }
  };

  /* ── Viva / Lab Helper: Copy Token to Clipboard for Postman ── */
  const copyTokenToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    showNotice("JWT token copied to clipboard! Ready to paste into Postman.", "success");
    setTimeout(() => setCopiedToken(false), 2500);
  };

  /* ── Viva / Lab Helper: Simulate 401 Expiry to Demo Redirection ── */
  const simulateExpiredToken = () => {
    localStorage.setItem("tm_auth_token", "invalid_or_expired_jwt_sample_token");
    setToken("invalid_or_expired_jwt_sample_token");
    // Trigger task fetch which immediately returns 401 and activates redirection
    authFetch("/tasks").catch(() => {});
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="app-shell">
      {/* ── Top Navigation / Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="brand-dot" />
          <div>
            <h1 className="brand-title">Task Management</h1>
            <p className="brand-subtitle">Practical 7 • Authentication & Middleware</p>
          </div>
        </div>

        {token && (
          <div className="header-user-panel">
            <div className="user-badge" title="Authenticated via JWT">
              <span className="user-icon"><IconShield /></span>
              <span className="user-email">{user?.email || "Authenticated User"}</span>
            </div>
            <button
              type="button"
              className="btn-subtle"
              onClick={copyTokenToClipboard}
              title="Copy active JWT for Postman testing"
            >
              <IconCopy /> {copiedToken ? "Copied" : "Copy Token"}
            </button>
            <button
              type="button"
              className="btn-subtle btn-logout"
              onClick={handleLogout}
              title="Clear token and sign out"
            >
              <IconLogOut /> Sign Out
            </button>
          </div>
        )}
      </header>

      {/* ── Notice / Toast Banner ── */}
      {notice && (
        <div className={`notice-banner notice-${notice.type}`}>
          <span className="notice-icon">
            {notice.type === "error" ? <IconAlert /> : <IconCheck />}
          </span>
          <span className="notice-text">{notice.text}</span>
          <button
            type="button"
            className="notice-dismiss"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        {!token ? (
          /* ── Unauthenticated State: Minimal Auth Card ── */
          <div className="auth-card-container">
            <div className="auth-card">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                  onClick={() => setAuthMode("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
              </div>

              <div className="auth-body">
                <div className="auth-intro">
                  <h2>{authMode === "login" ? "Welcome back" : "Create an account"}</h2>
                  <p>
                    {authMode === "login"
                      ? "Enter your credentials to access protected task routes."
                      : "Register with email and password to receive a signed JWT token."}
                  </p>
                </div>

                <form
                  onSubmit={authMode === "login" ? handleLogin : handleRegister}
                  className="auth-form"
                >
                  {authMode === "register" && (
                    <div className="input-group">
                      <label htmlFor="reg-name">Full Name (Optional)</label>
                      <input
                        id="reg-name"
                        type="text"
                        placeholder="e.g. Samarth Kalavadia"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <label htmlFor="auth-email">Email Address</label>
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="user@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      type="password"
                      placeholder={authMode === "register" ? "At least 6 characters" : "••••••••"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary auth-submit-btn"
                    disabled={authSubmitting}
                  >
                    {authSubmitting
                      ? "Processing..."
                      : authMode === "login"
                      ? "Sign In"
                      : "Create Account"}
                  </button>
                </form>

                <div className="auth-footer-notes">
                  <div className="badge-row">
                    <span className="meta-pill">bcrypt 10-salt hashing</span>
                    <span className="meta-pill">JWT 1-hr expiry</span>
                    <span className="meta-pill">Protected Routes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Authenticated State: Task Dashboard ── */
          <div className="dashboard-grid">
            {/* Left Column: Create Task & Student Lab Helpers */}
            <aside className="sidebar-column">
              {/* Add Task Form */}
              <div className="card task-create-card">
                <div className="card-header">
                  <h3 className="card-title">New Task</h3>
                  <span className="card-badge">Server Validated</span>
                </div>
                <form onSubmit={handleAddTask} className="task-form">
                  <div className="input-group">
                    <label htmlFor="task-title">Task Title *</label>
                    <input
                      id="task-title"
                      type="text"
                      placeholder="e.g. Implement input validation middleware"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="task-desc">Description (optional)</label>
                    <textarea
                      id="task-desc"
                      rows={3}
                      placeholder="Add supplementary details or notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    <IconPlus /> Add Task
                  </button>
                </form>
              </div>

              {/* Lab & Viva Demonstration Box */}
              <div className="card lab-info-card">
                <h4 className="lab-info-title">Practical 7 Features</h4>
                <ul className="lab-feature-list">
                  <li>
                    <span className="feature-check">✓</span>
                    <span><strong>bcrypt:</strong> Passwords hashed with salt</span>
                  </li>
                  <li>
                    <span className="feature-check">✓</span>
                    <span><strong>JWT Bearer:</strong> Auth middleware on all task routes</span>
                  </li>
                  <li>
                    <span className="feature-check">✓</span>
                    <span><strong>Validation Middleware:</strong> Rejects empty titles</span>
                  </li>
                  <li>
                    <span className="feature-check">✓</span>
                    <span><strong>/me Endpoint:</strong> Returns verified user details</span>
                  </li>
                </ul>

                <div className="lab-action-row">
                  <button
                    type="button"
                    className="btn-outline-danger"
                    onClick={simulateExpiredToken}
                    title="Tests client-side 401 response interception and redirection"
                  >
                    Simulate 401 Expiry
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Column: Tasks List & Metrics */}
            <section className="main-tasks-column">
              {/* Metrics & Filter Bar */}
              <div className="task-toolbar">
                <div className="stats-pills">
                  <span className="stat-pill">Total: <strong>{tasks.length}</strong></span>
                  <span className="stat-pill">Pending: <strong>{pendingCount}</strong></span>
                  <span className="stat-pill">Completed: <strong>{completedCount}</strong></span>
                </div>

                <div className="filter-group">
                  <button
                    type="button"
                    className={`filter-btn ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${filter === "pending" ? "active" : ""}`}
                    onClick={() => setFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${filter === "completed" ? "active" : ""}`}
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Task Items */}
              {loading && tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="loading-spinner" />
                  <p>Loading tasks from protected API...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-title">No tasks found</p>
                  <p className="empty-desc">
                    {filter === "all"
                      ? "Create your first task using the form on the left."
                      : `No ${filter} tasks right now.`}
                  </p>
                </div>
              ) : (
                <div className="task-list">
                  {filteredTasks.map((t) => (
                    <div
                      key={t._id}
                      className={`task-row ${t.completed ? "task-completed" : ""}`}
                    >
                      <button
                        type="button"
                        className={`btn-checkbox ${t.completed ? "checked" : ""}`}
                        onClick={() => handleToggleComplete(t)}
                        title={t.completed ? "Mark as pending" : "Mark as completed"}
                      >
                        {t.completed && <IconCheck />}
                      </button>

                      <div className="task-details">
                        <span className="task-name">{t.title}</span>
                        {t.description && (
                          <span className="task-note">{t.description}</span>
                        )}
                        <span className="task-time">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>

                      <div className="task-row-actions">
                        <button
                          type="button"
                          className="btn-action-icon"
                          onClick={() => {
                            setEditingTask(t);
                            setEditTitle(t.title);
                            setEditDescription(t.description || "");
                          }}
                          title="Edit Task"
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon btn-action-delete"
                          onClick={() => handleDeleteTask(t._id)}
                          title="Delete Task"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ── Edit Task Modal ── */}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Task</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingTask(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="input-group">
                <label htmlFor="edit-task-title">Title</label>
                <input
                  id="edit-task-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label htmlFor="edit-task-desc">Description</label>
                <textarea
                  id="edit-task-desc"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-subtle"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
