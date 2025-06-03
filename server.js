const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const projectRouter = require("./routes/projectRoute");
const contactRoute = require("./routes/contactRoute");
const resumeRoutes = require("./routes/resume");

const app = express();
const PORT = process.env.PORT;

// ✅ Use built-in body parsers with size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const allowedOrigins = [
  "https://ahmeddev-pi.vercel.app",
  "https://ahmeddev-git-main-ahmeds-projects-0032f4c9.vercel.app",
  "https://ahmed-lgj4g35fd-ahmeds-projects-0032f4c9.vercel.app",
  "http://localhost:3000", // for local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRouter);
app.use("/api/contact", contactRoute);
app.use("/api", resumeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
