const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET / - Retrieve all tasks
router.get("/", async (req, res, next) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
});

// POST / - Create a new task
router.post("/", async (req, res, next) => {
    try {
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            completed: req.body.completed
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

// PUT /:id - Update a task
router.put("/:id", async (req, res, next) => {
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

// DELETE /:id - Delete a task
router.delete("/:id", async (req, res, next) => {
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
