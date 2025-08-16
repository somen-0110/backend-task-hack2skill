const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/task.controller");
const {
  createOrUpdateTaskValidator,
  taskIdParamValidator,
  putSubtasksValidator,
} = require("../utils/validators");
const { validationResult } = require("express-validator");

// Tasks
router.get("/tasks", auth, ctrl.listTasks);
router.post("/tasks", auth, createOrUpdateTaskValidator, ctrl.createTask);
router.put(
  "/tasks/:taskId",
  auth,
  taskIdParamValidator,
  createOrUpdateTaskValidator,
  ctrl.updateTask
);
router.delete("/tasks/:taskId", auth, taskIdParamValidator, ctrl.deleteTask);

// Subtasks
router.get(
  "/tasks/:taskId/subtasks",
  auth,
  taskIdParamValidator,
  ctrl.listSubtasks
);
router.put(
  "/tasks/:taskId/subtasks",
  auth,
  taskIdParamValidator,
  putSubtasksValidator,
  ctrl.putSubtasks
);

module.exports = router;
