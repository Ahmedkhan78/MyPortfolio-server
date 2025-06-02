const { projectCollection } = require("../firebase/firebase");
const cloudinary = require("../utils/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// 🟢 GET all projects
const getAllProjects = async (req, res) => {
  try {
    const snapshot = await projectCollection.get();
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// 🔵 POST: Create new project
const createProject = async (req, res) => {
  const { title, description, link } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one image file is required" });
  }

  try {
    const imageResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer))
    );

    const docRef = await projectCollection.add({
      title,
      description,
      images: imageResults,
      link,
      createdBy: req.user.username,
      createdAt: new Date(),
    });

    res.status(201).json({
      id: docRef.id,
      title,
      description,
      images: imageResults,
      link,
      createdBy: req.user.username,
    });
  } catch (err) {
    console.error("Error uploading or saving project:", err);
    res.status(500).json({ error: "Failed to add project" });
  }
};

// 🟡 PUT: Update project
const updateProject = async (req, res) => {
  const { title, description, link } = req.body;
  const files = req.files;
  const projectId = req.params.id;

  try {
    const docRef = projectCollection.doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const existing = doc.data();
    let imageResults = existing.images || [];

    if (files && files.length > 0) {
      // Delete old images
      if (existing.images?.length) {
        await Promise.all(
          existing.images.map((img) =>
            cloudinary.uploader.destroy(img.public_id)
          )
        );
      }

      // Upload new images
      imageResults = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer))
      );
    }

    await docRef.update({
      title: title ?? existing.title,
      description: description ?? existing.description,
      images: imageResults,
      link: link ?? existing.link,
      updatedAt: new Date(),
    });

    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// 🔴 DELETE: Remove project
const deleteProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    const docRef = projectCollection.doc(projectId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const data = doc.data();

    if (data.images?.length) {
      await Promise.all(
        data.images.map((img) => cloudinary.uploader.destroy(img.public_id))
      );
    }

    await docRef.delete();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
};
