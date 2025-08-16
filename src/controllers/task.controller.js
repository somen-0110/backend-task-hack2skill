const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/User");

// Helper to present only non-deleted tasks/subtasks
function sanitizeUserTasks(user) {
  const tasks = (user.tasks || [])
    .filter((t) => !t.isDeleted)
    .map((t) => ({
      _id: t._id,
      subject: t.subject,
      deadline: t.deadline,
      status: t.status,
      subtasks: (t.subtasks || [])
        .filter((st) => !st.isDeleted)
        .map((st) => ({
          _id: st._id,
          subject: st.subject,
          deadline: st.deadline,
          status: st.status,
        })),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  return tasks;
}

// GET /tasks
exports.listTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const tasks = sanitizeUserTasks(user);
    res.json({ tasks });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list tasks", error: err.message });
  }
};

// POST /tasks
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { subject, deadline, status = "pending" } = req.body;

    const newTask = {
      _id: new mongoose.Types.ObjectId(),
      subject,
      deadline: new Date(deadline),
      status,
      isDeleted: false,
      subtasks: [],
    };

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { tasks: newTask } },
      { new: true }
    );

    const created = sanitizeUserTasks(updated).find((t) =>
      t._id.equals(newTask._id)
    );
    res.status(201).json({ task: created });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create task", error: err.message });
  }
};

// PUT /tasks/:taskId
exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { taskId } = req.params;
    const { subject, deadline, status } = req.body;

    const user = await User.findOne({
      _id: req.user._id,
      "tasks._id": taskId,
    });

    if (!user) return res.status(404).json({ message: "Task not found" });

    const idx = user.tasks.findIndex((t) => t._id.equals(taskId));
    if (idx === -1) return res.status(404).json({ message: "Task not found" });
    if (user.tasks[idx].isDeleted)
      return res.status(400).json({ message: "Cannot update a deleted task" });

    if (subject !== undefined) user.tasks[idx].subject = subject;
    if (deadline !== undefined) user.tasks[idx].deadline = new Date(deadline);
    if (status !== undefined) user.tasks[idx].status = status;

    await user.save();

    const updatedTask = {
      _id: user.tasks[idx]._id,
      subject: user.tasks[idx].subject,
      deadline: user.tasks[idx].deadline,
      status: user.tasks[idx].status,
      subtasks: user.tasks[idx].subtasks
        .filter((st) => !st.isDeleted)
        .map((st) => ({
          _id: st._id,
          subject: st.subject,
          deadline: st.deadline,
          status: st.status,
        })),
      createdAt: user.tasks[idx].createdAt,
      updatedAt: user.tasks[idx].updatedAt,
    };

    res.json({ task: updatedTask });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update task", error: err.message });
  }
};

// DELETE /tasks/:taskId (soft delete)
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findOne({
      _id: req.user._id,
      "tasks._id": taskId,
    });

    if (!user) return res.status(404).json({ message: "Task not found" });

    const idx = user.tasks.findIndex((t) => t._id.equals(taskId));
    if (idx === -1) return res.status(404).json({ message: "Task not found" });
    if (user.tasks[idx].isDeleted)
      return res.status(200).json({ message: "Task already deleted" });

    user.tasks[idx].isDeleted = true;
    await user.save();

    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete task", error: err.message });
  }
};

// GET /tasks/:taskId/subtasks
exports.listSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findOne({
      _id: req.user._id,
      "tasks._id": taskId,
    });

    if (!user) return res.status(404).json({ message: "Task not found" });

    const task = user.tasks.find((t) => t._id.equals(taskId));
    if (!task || task.isDeleted)
      return res.status(404).json({ message: "Task not found" });

    const subtasks = task.subtasks
      .filter((st) => !st.isDeleted)
      .map((st) => ({
        _id: st._id,
        subject: st.subject,
        deadline: st.deadline,
        status: st.status,
        createdAt: st.createdAt,
        updatedAt: st.updatedAt,
      }));

    res.json({ subtasks });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list subtasks", error: err.message });
  }
};

// PUT /tasks/:taskId/subtasks (replace all non-deleted subtasks)
exports.putSubtasks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { taskId } = req.params;
    const incoming = req.body; // full list of non-deleted subtasks

    // Normalize and assign IDs if missing (only for non-deleted subtasks)
    const normalized = incoming.map((s) => ({
      _id: s._id
        ? new mongoose.Types.ObjectId(s._id)
        : new mongoose.Types.ObjectId(),
      subject: s.subject,
      deadline: new Date(s.deadline),
      status: s.status || "pending",
      isDeleted: false,
    }));

    const user = await User.findOne({
      _id: req.user._id,
      "tasks._id": taskId,
    });

    if (!user) return res.status(404).json({ message: "Task not found" });

    const idx = user.tasks.findIndex((t) => t._id.equals(taskId));
    if (idx === -1) return res.status(404).json({ message: "Task not found" });
    const task = user.tasks[idx];
    if (task.isDeleted)
      return res
        .status(400)
        .json({ message: "Cannot modify subtasks of a deleted task" });

    // Preserve previously deleted subtasks in DB; only replace the non-deleted set
    const deletedSubtasks = (task.subtasks || []).filter((st) => st.isDeleted);
    task.subtasks = [...normalized, ...deletedSubtasks];

    await user.save();

    const response = task.subtasks
      .filter((st) => !st.isDeleted)
      .map((st) => ({
        _id: st._id,
        subject: st.subject,
        deadline: st.deadline,
        status: st.status,
      }));

    res.json({ subtasks: response });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update subtasks", error: err.message });
  }
};
