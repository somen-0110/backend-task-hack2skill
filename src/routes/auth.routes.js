const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../utils/validators");
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

module.exports = router;
