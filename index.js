const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./app/database/init");
require("dotenv").config();

const authRoutes = require("./app/routes/auth.routes");
const mentorRoutes = require("./app/routes/mentor.routes");
const videoLessonRoutes = require("./app/routes/videoLesson.routes");
const curriculumRoutes = require("./app/routes/curriculum.routes");
const subcurriculumRoutes = require("./app/routes/subcurriculum.routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

connectDB();

// Auth Routes
app.use("/api", authRoutes);

// Mentor Routes
app.use("/api/mentor", mentorRoutes);

// Video Lesson Routes
app.use("/api/video-lesson", videoLessonRoutes);

// Curriculum Routes
app.use("/api/curriculum", curriculumRoutes);

// Subcurriculum Routes
app.use("/api/subcurriculum", subcurriculumRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
