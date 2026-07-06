const path = require("path");
const fs = require("fs");
const resumes = require("../data/resumes");

exports.getResume = (req, res) => {
  const { file } = req.params;

  const resume = resumes.find((r) => r.file === file);

  if (!resume) {
    return res.status(404).json({
      message: "Resume not found",
    });
  }

  const filePath = path.join(__dirname, "..", "files", `${resume.file}.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "PDF not found",
    });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${resume.file}.pdf`);

  res.sendFile(filePath);
};

exports.getResumeList = (req, res) => {
  res.json(resumes);
};
