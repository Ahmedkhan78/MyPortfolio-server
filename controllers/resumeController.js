const path = require("path");

exports.getResume = (req, res) => {
  const filePath = path.join(__dirname, "..", "files", "resume.pdf");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=resume.pdf"); // ya 'attachment' agar download karwana ho
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending resume:", err);
      res.status(500).send("Could not send the resume file.");
    }
  });
};
