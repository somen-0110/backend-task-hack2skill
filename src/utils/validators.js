const { body, param } = require("express-validator");

const isISODate = (value) => !isNaN(Date.parse(value));

const registerValidator = [
  body("name").isString().trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8 }),
];

const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8 }),
];

const createOrUpdateTaskValidator = [
  body("subject").isString().trim().notEmpty(),
  body("deadline").custom(isISODate),
  body("status").optional().isIn(["pending", "in_progress", "done"]),
];

const taskIdParamValidator = [param("taskId").isMongoId()];

const putSubtasksValidator = [
  body().isArray(),
  body("*.subject").isString().trim().notEmpty(),
  body("*.deadline").custom(isISODate),
  body("*.status").optional().isIn(["pending", "in_progress", "done"]),
];

module.exports = {
  registerValidator,
  loginValidator,
  createOrUpdateTaskValidator,
  taskIdParamValidator,
  putSubtasksValidator,
};
