const mongoose = require("mongoose");

const connectDB = async (uri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log("Mongo DB connection successfull");
};

module.exports = connectDB;
