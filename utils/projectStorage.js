const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/projects.json");

function getProjects() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveProjects(projects) {
  fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));
}

module.exports = { getProjects, saveProjects };
