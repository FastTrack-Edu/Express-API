const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./app/database/init");
require("dotenv").config();

const authRoutes = require("./app/routes/auth.routes");
const profileRoutes = require("./app/routes/profile.routes");
const mentorRoutes = require("./app/routes/mentor.routes");
const videoLessonRoutes = require("./app/routes/videoLesson.routes");
const curriculumRoutes = require("./app/routes/curriculum.routes");
const subcurriculumRoutes = require("./app/routes/subcurriculum.routes");
const reviewRoutes = require("./app/routes/review.routes");
const eventRoutes = require("./app/routes/event.routes");
const termConditionRoutes = require("./app/routes/termCondition.routes");
const timelineRoutes = require("./app/routes/timeline.routes");
const paymentRoutes = require("./app/routes/payment.routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connectDB();

// Auth Routes
app.use("/api", authRoutes);

// Profile Routes
app.use("/api/profile", profileRoutes);

// Mentor Routes
app.use("/api/mentor", mentorRoutes);

// Video Lesson Routes
app.use("/api/video-lesson", videoLessonRoutes);

// Curriculum Routes
app.use("/api/video-lesson/curriculum", curriculumRoutes);

// Subcurriculum Routes
app.use("/api/video-lesson/subcurriculum", subcurriculumRoutes);

// Review Routes
app.use("/api/review", reviewRoutes);

// Event Routes
app.use("/api/event", eventRoutes);

// Term Condition Routes
app.use("/api/event/term-condition", termConditionRoutes);

// Timeline Routes
app.use("/api/event/timeline", timelineRoutes);

// Payment Routes
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
