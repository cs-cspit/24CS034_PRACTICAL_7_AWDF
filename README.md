# Web Development Practicals (SEM 5)

## 📌 Practical 4: Building a RESTful API with Node.js and Express
- Basic Express server setup on port `3000`.
- In-memory array task store.
- Custom logging middleware (`middleware/logger.js`).
- Modular route handlers using Express Router (`routes/taskRoutes.js`).
- Global error handling & 404 handler.

---

## 🚀 PRACTICAL 5 STARTS FROM HERE: MongoDB Integration and Schema Design with Mongoose
Practical 5 evolves the Task Manager API by replacing the in-memory array with persistent storage using **MongoDB Atlas** and **Mongoose ODM**.

### 🌟 Practical 5 Key Enhancements
1. **Mongoose ODM Integration**: Added `mongoose` for database modeling and schema enforcement.
2. **Task Schema & Model** (`models/Task.js`):
   - `title`: String, required.
   - `description`: String, optional.
   - `completed`: Boolean, default `false`.
   - `createdAt`: Date, default `Date.now`.
3. **Async/Await CRUD Operations**:
   - `GET /tasks`: Uses `Task.find()`.
   - `POST /tasks`: Uses `task.save()`.
   - `PUT /tasks/:id`: Uses `Task.findByIdAndUpdate()` with `{ new: true, runValidators: true }`.
   - `DELETE /tasks/:id`: Uses `Task.findByIdAndDelete()`.
4. **Enhanced Error Handling** (`middleware/errorHandler.js`):
   - `ValidationError` handling returning `400 Bad Request` with structured JSON.
   - `CastError` handling returning `400 Bad Request` for invalid ObjectIds.
   - `500 Internal Server Error` for unhandled exceptions.
5. **Secure Database Configuration**:
   - Uses environment variable `MONGODB_URI` via `dotenv` without exposing credentials.

---

## 📂 Project Structure
```
TaskManagerAPI/
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
```

---

## ⚙️ Setup & Running

1. **Navigate to the project folder:**
   ```bash
   cd TaskManagerAPI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file inside `TaskManagerAPI/` (refer to `.env.example`):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskdb
   ```

4. **Start the API Server:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000` and connect to MongoDB Atlas.

---

## 🌐 API Endpoints
| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Retrieve all tasks from MongoDB Atlas | `200 OK` |
| `POST` | `/tasks` | Create a new task (validates required title) | `201 Created` / `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update an existing task by MongoDB ObjectId | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `DELETE` | `/tasks/:id` | Delete a task by MongoDB ObjectId | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `*` | `/*` | Route Not Found handler | `404 Not Found` |
