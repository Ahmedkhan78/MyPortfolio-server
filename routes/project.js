const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

const { getProjects, saveProjects } = require("../utils/projectStorage.js"); // Updated util name

const verifyToken = (req, res, next) => {
  const authHeader = req.header("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(403).json({ error: "No Token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// GET all projects (public)
router.get("/", (req, res) => {
  const projects = getProjects();
  res.json(projects);
});

// POST a new project (admin only)
router.post("/", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const projects = getProjects();
  const { title, description, image, link } = req.body;

  const newProject = {
    id: Date.now(),
    title,
    description,
    image,
    link,
    createdBy: req.user.username,
  };

  projects.push(newProject);
  saveProjects(projects);

  res.status(201).json(newProject);
});

// PUT to update project
router.put("/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const projects = getProjects();
  const project = projects.find((p) => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: "Project not found" });

  project.title = req.body.title || project.title;
  project.description = req.body.description || project.description;
  project.image = req.body.image || project.image;
  project.link = req.body.link || project.link;

  saveProjects(projects);
  res.json(project);
});

// DELETE a project
router.delete("/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  let projects = getProjects();
  const index = projects.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Project not found" });

  projects.splice(index, 1);
  saveProjects(projects);

  res.status(204).send();
});

module.exports = router;
