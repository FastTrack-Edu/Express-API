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
const courseRoutes = require("./app/routes/course.routes");
const benefitRoutes = require("./app/routes/benefit.routes");
const subbenefitRoutes = require("./app/routes/subbenefit.routes");
const courseLiveRoutes = require("./app/routes/courseLive.routes");
const courseVideoRoutes = require("./app/routes/courseVideo.routes");
const courseModulRoutes = require("./app/routes/courseModul.routes");
const mentoringRoutes = require("./app/routes/mentoring.routes");
const facilityRoutes = require("./app/routes/facility.routes");
const reviewRoutes = require("./app/routes/review.routes");
const eventRoutes = require("./app/routes/event.routes");
const eventRegistrationRoutes = require("./app/routes/eventRegistration.routes");
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
app.use("/api/curriculum", curriculumRoutes);

// Subcurriculum Routes
app.use("/api/subcurriculum", subcurriculumRoutes);

// Course Routes
app.use("/api/course", courseRoutes);

// Benefit Routes
app.use("/api/benefit", benefitRoutes);

// Subbenefit Routes
app.use("/api/subbenefit", subbenefitRoutes);

// Course Live Routes
app.use("/api/course-live", courseLiveRoutes);

// Course Video Routes
app.use("/api/course-video", courseVideoRoutes);

// Course Modul Routes
app.use("/api/course-modul", courseModulRoutes);

// Mentoring Routes
app.use("/api/mentoring", mentoringRoutes);

// Facility Routes
app.use("/api/facility", facilityRoutes);

// Review Routes
app.use("/api/review", reviewRoutes);

// Event Routes
app.use("/api/event", eventRoutes);

// Event Registration Routes
app.use("/api/registration", eventRegistrationRoutes);

// Term Condition Routes
app.use("/api/term-condition", termConditionRoutes);

// Timeline Routes
app.use("/api/timeline", timelineRoutes);

// Payment Routes
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
