const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary"); // yaha apni cloudinary config import kar
const router = express.Router();
require("dotenv").config();

const { projectCollection } = require("../firebase"); // sirf firestore use ho raha hai

const upload = multer({ storage: multer.memoryStorage() });

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

router.get("/", async (req, res) => {
  try {
    const snapshot = await projectCollection.get();
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});
// POST new project (with Cloudinary upload)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { title, description, link } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    // Cloudinary upload (buffer to base64)
    const result = await cloudinary.uploader.upload_stream(
      { folder: "projects" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Failed to upload image" });
        }
        // Save project in Firestore with Cloudinary URL
        const docRef = await projectCollection.add({
          title,
          description,
          image: result.secure_url,
          cloudinary_id: result.public_id, // store Cloudinary public_id for delete/update use
          link,
          createdBy: req.user.username,
          createdAt: new Date(),
        });

        res.status(201).json({
          id: docRef.id,
          title,
          description,
          image: result.secure_url,
          link,
          createdBy: req.user.username,
        });
      }
    );

    // Write buffer to stream
    require("streamifier").createReadStream(file.buffer).pipe(result);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to add project" });
  }
});

// PUT update project (optional image update)
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const projectId = req.params.id;
  const { title, description, link } = req.body;
  const file = req.file;

  try {
    const docRef = projectCollection.doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    let imageUrl = doc.data().image;
    let cloudinaryId = doc.data().cloudinary_id;

    if (file) {
      // Delete old image from Cloudinary if exists
      if (cloudinaryId) {
        await cloudinary.uploader.destroy(cloudinaryId);
      }

      // Upload new image
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "projects" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        require("streamifier").createReadStream(file.buffer).pipe(stream);
      });

      imageUrl = uploadResult.secure_url;
      cloudinaryId = uploadResult.public_id;
    }

    await docRef.update({
      title: title ?? doc.data().title,
      description: description ?? doc.data().description,
      image: imageUrl,
      cloudinary_id: cloudinaryId,
      link: link ?? doc.data().link,
      updatedAt: new Date(),
    });

    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE project (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const projectId = req.params.id;

  try {
    const docRef = projectCollection.doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete image from Cloudinary if exists
    if (doc.data().cloudinary_id) {
      await cloudinary.uploader.destroy(doc.data().cloudinary_id);
    }

    await docRef.delete();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

module.exports = router;
