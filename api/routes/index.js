var express = require("express");
var router = express.Router();
var multer = require("multer");
var path = require("path");
var fs = require("fs-extra");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
fs.ensureDirSync(path.join(__dirname, "../uploads/"));
// Create temp directory for chunks
fs.ensureDirSync(path.join(__dirname, "../uploads/temp"));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("button clicked");
});

router.post("/api/add", function (req, res, next) {
  const { num1, num2 } = req.body;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send("Invalid input");
  }
  const sum = parseInt(num1) + parseInt(num2);
  res.json({ sum });
});

router.get("/api/subtract", function (req, res, next) {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send("Invalid input");
  }
  const diff = parseInt(num1) - parseInt(num2);
  res.json({ diff });
});

// Single file upload - regular method
router.post("/api/upload", upload.single("file"), function (req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "File uploaded successfully",
    file: {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    },
  });
});

// Handle chunked file upload - initialization
router.post("/api/upload/init", function (req, res) {
  const { fileName, fileSize, totalChunks } = req.body;

  if (!fileName || !fileSize || !totalChunks) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const uploadId = Date.now().toString();
  const uploadDir = path.join(__dirname, "../uploads/temp", uploadId);

  // Create directory for this upload
  fs.ensureDirSync(uploadDir);

  // Store metadata
  fs.writeJsonSync(path.join(uploadDir, "metadata.json"), {
    fileName,
    fileSize,
    totalChunks,
    uploadedChunks: 0,
  });

  res.json({ uploadId });
});

// Handle chunked file upload - chunk
router.post("/api/upload/chunk", upload.single("chunk"), function (req, res) {
  const { uploadId, chunkIndex } = req.body;

  if (!uploadId || chunkIndex === undefined || !req.file) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const uploadDir = path.join(__dirname, "../uploads/temp", uploadId);
  const metadataPath = path.join(uploadDir, "metadata.json");

  if (!fs.existsSync(metadataPath)) {
    return res.status(404).json({ error: "Upload not found" });
  }

  // Read metadata
  const metadata = fs.readJsonSync(metadataPath);

  // Move chunk to correct location with index as filename
  const chunkPath = path.join(uploadDir, chunkIndex.toString());
  fs.moveSync(req.file.path, chunkPath, { overwrite: true });

  // Update metadata
  metadata.uploadedChunks += 1;
  fs.writeJsonSync(metadataPath, metadata);

  res.json({
    message: "Chunk uploaded successfully",
    uploadedChunks: metadata.uploadedChunks,
    totalChunks: metadata.totalChunks,
  });
});

// Handle chunked file upload - finalization
router.post("/api/upload/complete", function (req, res) {
  const { uploadId } = req.body;

  if (!uploadId) {
    return res.status(400).json({ error: "Missing upload ID" });
  }

  const uploadDir = path.join(__dirname, "../uploads/temp", uploadId);
  const metadataPath = path.join(uploadDir, "metadata.json");

  if (!fs.existsSync(metadataPath)) {
    return res.status(404).json({ error: "Upload not found" });
  }

  // Read metadata
  const metadata = fs.readJsonSync(metadataPath);

  // Check if all chunks were uploaded
  if (metadata.uploadedChunks !== metadata.totalChunks) {
    return res.status(400).json({
      error: "Not all chunks were uploaded",
      uploadedChunks: metadata.uploadedChunks,
      totalChunks: metadata.totalChunks,
    });
  }

  // Create output file
  const finalFilePath = path.join(__dirname, "../uploads", metadata.fileName);
  const outputStream = fs.createWriteStream(finalFilePath);

  // Concatenate all chunks
  const writePromises = [];
  for (let i = 0; i < metadata.totalChunks; i++) {
    const chunkPath = path.join(uploadDir, i.toString());
    const chunkData = fs.readFileSync(chunkPath);
    writePromises.push(
      new Promise((resolve, reject) => {
        outputStream.write(chunkData, (err) => {
          if (err) reject(err);
          else resolve();
        });
      })
    );
  }

  Promise.all(writePromises)
    .then(() => {
      outputStream.end();
      // Clean up chunks directory
      fs.removeSync(uploadDir);

      res.json({
        message: "File assembled successfully",
        file: {
          name: metadata.fileName,
          size: metadata.fileSize,
          path: finalFilePath,
        },
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to assemble file", details: err.message });
    });
});

// Get list of uploaded files
router.get("/api/files", function (req, res) {
  const uploadsDir = path.join(__dirname, "../uploads");

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to read uploads directory" });
    }

    // Filter out temp directory and non-files
    const fileList = files
      .filter((file) => {
        return (
          file !== "temp" && fs.statSync(path.join(uploadsDir, file)).isFile()
        );
      })
      .map((file) => {
        const stats = fs.statSync(path.join(uploadsDir, file));
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      });

    res.json({ files: fileList });
  });
});

module.exports = router;
