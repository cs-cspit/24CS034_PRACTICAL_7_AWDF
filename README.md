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

## 🚀 PRACTICAL 6 STARTS FROM HERE: Connecting React Frontend to Express + MongoDB Backend

Practical 6 connects a **React (Vite)** frontend to the **Express + MongoDB Atlas** backend using the native browser **Fetch API** and **CORS**.

### 🌟 Practical 6 Architecture Flow
```
React Frontend (localhost:5173)
       ↓ (Fetch API / CORS)
Express Backend (localhost:5000)
       ↓ (Mongoose ODM)
MongoDB Atlas (Cloud Cluster: taskdb.tasks)
```

### 📂 Project Structure
```
TaskManagerAPI/                     # Backend (Port 5000)
├── middleware/
│   ├── logger.js
│   └── errorHandler.js
├── models/
│   └── Task.js
├── routes/
│   └── taskRoutes.js
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── package-lock.json

task-manager-frontend/              # Frontend (Port 5173)
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
└── package-lock.json
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

### 2. Terminal 2: Start Frontend (Port 5173)
```bash
cd task-manager-frontend
npm install
npm run dev
```
*Access the app at: `http://localhost:5173`*

---

## 🌐 Full CRUD Mapping
| Action | Frontend Trigger | HTTP Method | API Endpoint | Database Operation |
| :--- | :--- | :--- | :--- | :--- |
| **Read** | Page Load (`useEffect`) | `GET` | `http://localhost:5000/tasks` | `Task.find()` |
| **Create** | Add Task Form Submit | `POST` | `http://localhost:5000/tasks` | `task.save()` |
| **Update** | Update Button (`prompt`) | `PUT` | `http://localhost:5000/tasks/:id` | `Task.findByIdAndUpdate()` |
| **Delete** | Delete Button (`confirm`) | `DELETE` | `http://localhost:5000/tasks/:id` | `Task.findByIdAndDelete()` |
