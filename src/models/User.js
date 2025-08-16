const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    subject: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true }
);

const TaskSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    subject: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
    subtasks: { type: [SubtaskSchema], default: [] },
  },
  { _id: false, timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    tasks: { type: [TaskSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
