// index.js
const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const projectRouter = require("./routes/project");

const app = express();
const PORT = process.env.PORT;

// // Middlewares
// app.use(bodyParser.json({ limit: "10mb" })); // or higher if needed
// app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
