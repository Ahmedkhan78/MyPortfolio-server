const express = require("express");
const multer = require("multer");
const {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const verifyToken = require("../middleware/verifyToken");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getAllProjects);
router.post("/", verifyToken, upload.array("images", 10), createProject);
router.put("/:id", verifyToken, upload.array("images", 10), updateProject);
router.delete("/:id", verifyToken, deleteProject);

module.exports = router;
