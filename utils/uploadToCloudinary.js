const streamifier = require("streamifier");
const cloudinary = require("./cloudinary");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "projects" },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;
