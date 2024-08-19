const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  instance: {
    type: String,
    default: null,
  },
  phone_number: {
    type: String,
    default: null,
    min: 10,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["member", "admin"],
    default: "member",
  },
  member_type: {
    type: String,
    enum: ["regular", "exclusive"],
    default: null,
  },
  password: {
    type: String,
    minLength: 8,
    required: true,
  },
  enrolled_courses: [
    {
      type: Schema.Types.ObjectId,
      ref: "VideoLesson",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model("User", userSchema);

module.exports = User;
