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

app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRouter);
app.use("/api/contact", contactRoute);
app.use("/api", resumeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
