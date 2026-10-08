const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const {
    validateCreateTask,
    validateUpdateTask,
    validateTaskId
} = require("../middleware/validateTask");

// Step 6: Apply the auth middleware to all task routes
router.use(auth);

/**
 * @route   GET /tasks
 * @desc    Retrieve all tasks for the authenticated user
 * @access  Private (Protected with Auth Middleware)
 */
router.get("/", async (req, res, next) => {
    try {
        // Query tasks belonging to the authenticated user, or general unassigned tasks
        const tasks = await Task.find({
            $or: [{ user: req.user.id }, { user: { $exists: false } }, { user: null }]
        }).sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /tasks/:id
 * @desc    Retrieve a single task by ID
 * @access  Private (Protected with Auth Middleware)
 */
router.get("/:id", validateTaskId, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        res.status(200).json(task);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /tasks
 * @desc    Create a new task (Pipeline: Auth Middleware -> Validation Middleware -> Controller)
 * @access  Private
 */
router.post("/", validateCreateTask, async (req, res, next) => {
    try {
        const task = new Task({
            title: req.body.title,
            description: req.body.description || "",
            completed: req.body.completed || false,
            user: req.user.id
        });
        const savedTask = await task.save();
        res.status(201).json({
            message: "Task created successfully",
            task: savedTask
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /tasks/:id
 * @desc    Update a task (Pipeline: Auth Middleware -> Validation Middleware -> Controller)
 * @access  Private
 */
router.put("/:id", validateUpdateTask, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        res.status(200).json({
            message: "Task updated successfully",
            task: task
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete("/:id", validateTaskId, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }
        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
