# Practical 4: Building a RESTful API with Node.js and Express

## Overview
This project implements a RESTful Task Manager API using Node.js and Express with an in-memory data store, custom logging middleware, global error handling, and structured routing.

## Project Structure
```
TaskManagerAPI/
├── middleware/
│   ├── logger.js
│   └── errorHandler.js
├── routes/
│   └── taskRoutes.js
├── app.js
├── package.json
└── package-lock.json
```

## Setup & Running
1. Navigate to the project directory:
   ```bash
   cd TaskManagerAPI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`.

## API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/tasks` | Retrieve all tasks |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update an existing task |
| `DELETE` | `/tasks/:id` | Delete a task by ID |
| `*` | `/*` | 404 Route Not Found handler |
