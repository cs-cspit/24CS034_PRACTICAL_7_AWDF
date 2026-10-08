# Web Development Practicals (SEM 5)

## 📌 Practical 4: Building a RESTful API with Node.js and Express
- Basic Express server setup on port `3000`.
- In-memory array task store.
- Custom logging middleware (`middleware/logger.js`).
- Modular route handlers using Express Router (`routes/taskRoutes.js`).
- Global error handling & 404 handler.

---

## 📌 Practical 5: MongoDB Integration and Schema Design with Mongoose
- Integrated **MongoDB Atlas** cloud database with `taskdb` database and `tasks` collection.
- Defined Mongoose schema and model (`models/Task.js`) with required `title`, defaults, and timestamps.
- Refactored all CRUD operations to asynchronous Mongoose methods (`Task.find()`, `task.save()`, `Task.findByIdAndUpdate()` with `runValidators: true`, `Task.findByIdAndDelete()`).
- Added structured error handling for `ValidationError` and `CastError` (`400 Bad Request`).

---

## 📌 Practical 6: Connecting React Frontend to Express + MongoDB Backend
- Connected a **React (Vite)** frontend to the **Express + MongoDB Atlas** backend using the native browser **Fetch API** and **CORS**.
- State-managed CRUD operations with real-time feedback.

---

## 🚀 PRACTICAL 7: Authentication and Middleware Pipeline

### 🎯 Objective
To implement **JWT-based authentication** and **input validation** as part of the Express middleware pipeline.

### 🏛️ Architecture & Middleware Pipeline Flow
```
POST /register  ──>  Hash password (bcrypt, 10 salt rounds)  ──>  Save User  ──>  201 Created (+ JWT)
POST /login     ──>  Verify password (bcrypt.compare)       ──>  Sign JWT   ──>  200 OK (Token: Bearer)

Protected Routes Flow (/tasks, /me):
Client Request [Authorization: Bearer <token>]
       │
       ▼
 [Auth Middleware]          ──> Extracts Bearer token, verifies via jwt.verify(), attaches req.user
       │                        (Returns 401 Unauthorized if missing, invalid, or expired)
       ▼
 [Validation Middleware]    ──> Validates payload (title required, non-empty string, boolean check)
       │                        (Returns 400 Bad Request if validation fails, rejecting before DB)
       ▼
 Controller (Task Routes)   ──> Executes DB operation scoped to req.user.id
```

### 📂 Practical 7 Project Structure
```
TaskManagerAPI/                     # Backend (Port 5000)
├── middleware/
│   ├── auth.js                     # JWT verification & req.user attachment (401 handler)
│   ├── validateTask.js             # Server-side input validation middleware (400 handler)
│   ├── logger.js                   # Request logging middleware
│   └── errorHandler.js             # Global central error handling
├── models/
│   ├── User.js                     # User schema (email, bcrypt password, timestamps)
│   └── Task.js                     # Task schema (title, desc, completed, user ref)
├── routes/
│   ├── authRoutes.js               # /register, /login, and /me endpoints
│   └── taskRoutes.js               # Protected CRUD task routes with validation pipeline
├── test-api.js                     # Automated verification test suite (15/15 tests)
├── .env                            # Excluded from git via .gitignore
├── .env.example                    # Template with PORT, MONGODB_URI, and JWT_SECRET
├── .gitignore                      # Strictly ignores .env, node_modules
├── app.js                          # Express app configuration & middleware mounts
├── package.json
└── package-lock.json

task-manager-frontend/              # Frontend (Port 5173 - React + Vite)
├── src/
│   ├── App.jsx                     # Minimal Subtle UI: Auth tabs, Tasks, /me, 401 interceptor
│   ├── App.css                     # Minimalist Subtle Styling (neutral palette, clean borders)
│   ├── index.css                   # Global reset
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ How to Run Both Applications

### 1. Terminal 1: Start Backend (Port 5000)
```bash
cd TaskManagerAPI
npm install
npm start
```
*Output: `Server running at http://localhost:5000` & `MongoDB connected successfully`*

To run automated backend validation tests:
```bash
node test-api.js
```
*(All 15 assertions: auth rejection, register, duplicate check, password strength, login, /me, validation middleware, task CRUD)*

### 2. Terminal 2: Start Frontend (Port 5173)
```bash
cd task-manager-frontend
npm install
npm run dev
```
*Access the app at: `http://localhost:5173`*

---

## 🔑 Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` (or `/register`) | Public | Register user, bcrypt hash password, return 201 + JWT |
| `POST` | `/auth/login` (or `/login`) | Public | Verify password with bcrypt.compare, return 200 + JWT |
| `GET` | `/auth/me` (or `/me`) | Private (`Bearer <token>`) | Returns logged-in user details excluding password |
| `GET` | `/tasks` | Private (`Bearer <token>`) | Get all tasks for authenticated user |
| `POST` | `/tasks` | Private (`Bearer <token>`) | Create task (validated by input middleware) |
| `PUT` | `/tasks/:id` | Private (`Bearer <token>`) | Update task completion or title/desc |
| `DELETE`| `/tasks/:id` | Private (`Bearer <token>`) | Delete task |

---

## 🧪 Postman Testing Flow
1. **Register**: `POST http://localhost:5000/auth/register`
   - Body (JSON): `{"email": "samarth@test.com", "password": "password123"}`
   - Expected: `201 Created` with signed token.
2. **Login**: `POST http://localhost:5000/auth/login`
   - Body (JSON): `{"email": "samarth@test.com", "password": "password123"}`
   - Expected: `200 OK` with token. Copy the token.
3. **Get User Profile**: `GET http://localhost:5000/auth/me`
   - Header: `Authorization: Bearer <token>`
   - Expected: `200 OK` with user details (no password).
4. **Access Protected Tasks**: `GET http://localhost:5000/tasks`
   - Header: `Authorization: Bearer <token>`
   - Expected: `200 OK` with task array.
5. **Test Input Validation Middleware**: `POST http://localhost:5000/tasks`
   - Header: `Authorization: Bearer <token>`
   - Body: `{"title": ""}`
   - Expected: `400 Bad Request` with message: `"Validation error: Task title is required and cannot be empty"`.

---

## 💡 Key Viva & Analysis Questions

### 1. Why must passwords be hashed before storage instead of saved as plain text, even in a lab/demo project?
Plain-text passwords expose users to severe risk if a database leak, insider breach, or log dump occurs. Users frequently reuse passwords across services; leaking one plain-text password can compromise accounts everywhere. `bcrypt` adds a cryptographic salt and computationally intensive key stretching (work factor) to thwart rainbow tables and brute-force GPU attacks.

### 2. What does the authentication middleware actually verify, and what happens if the token is missing or expired?
The authentication middleware:
1. Inspects the `Authorization` header for the `Bearer <token>` format.
2. Verifies the cryptographic signature against `process.env.JWT_SECRET`.
3. Verifies token payload expiration (`exp`).
- If missing or malformed: returns `401 Unauthorized` (`Access denied. No token provided`).
- If expired or tampered: `jwt.verify()` throws `TokenExpiredError` or `JsonWebTokenError`, safely caught by `try/catch` to return `401 Unauthorized` without crashing the Express server.

### 3. Why should input validation happen on the server even if the frontend already validates the same fields?
Client-side validation is solely for user experience (immediate feedback). Any user or attacker can bypass frontend validation entirely using Postman, cURL, or browser dev tools. Server-side validation guarantees data integrity, prevents malformed database entries, and guards against injection and denial-of-service payloads before they reach the database layer.
