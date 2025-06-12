import React, { useState, useEffect, useRef } from "react";
import {
  uploadFile,
  initChunkedUpload,
  uploadChunk,
  completeChunkedUpload,
  getFilesList,
} from "../service/fetchData";

// Set chunk size to 1MB
const CHUNK_SIZE = 1024 * 1024;

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [fileList, setFileList] = useState([]);
  const [useChunkedUpload, setUseChunkedUpload] = useState(false);

  const abortControllerRef = useRef(null);

  // Fetch list of uploaded files on component mount
  useEffect(() => {
    fetchFilesList();
  }, []);

  const fetchFilesList = async () => {
    try {
      const response = await getFilesList();
      setFileList(response.files || []);
    } catch (error) {
      console.error("Error fetching files list:", error);
      setUploadStatus("Failed to fetch files list");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setProgress(0);
    setUploadStatus("");

    // Auto-select chunked upload for files larger than 5MB
    if (file && file.size > 5 * 1024 * 1024) {
      setUseChunkedUpload(true);
    }
  };

  const handleUploadToggle = () => {
    setUseChunkedUpload(!useChunkedUpload);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadStatus("Uploading...");

    try {
      // Create a new AbortController for this upload
      abortControllerRef.current = new AbortController();

      if (useChunkedUpload) {
        await handleChunkedUpload();
      } else {
        await handleSimpleUpload();
      }

      // Refresh file list after successful upload
      fetchFilesList();
    } catch (error) {
      if (error.name === "AbortError") {
        setUploadStatus("Upload cancelled");
      } else {
        console.error("Upload error:", error);
        setUploadStatus(`Upload failed: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSimpleUpload = async () => {
    const result = await uploadFile(selectedFile);
    setProgress(100);
    setUploadStatus(`Upload complete: ${result.file.name}`);
  };

  const handleChunkedUpload = async () => {
    // Calculate total chunks
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);

    // Initialize upload
    const initResult = await initChunkedUpload(
      selectedFile.name,
      selectedFile.size,
      totalChunks
    );

    const { uploadId } = initResult;

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      // Check if upload was cancelled
      if (!abortControllerRef.current) {
        throw new Error("Upload cancelled");
      }

      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
      const chunk = selectedFile.slice(start, end);

      await uploadChunk(chunk, uploadId, i);

      // Update progress
      const newProgress = Math.round(((i + 1) / totalChunks) * 100);
      setProgress(newProgress);
      setUploadStatus(
        `Uploading chunk ${i + 1}/${totalChunks} (${newProgress}%)`
      );
    }

    // Complete upload
    const completeResult = await completeChunkedUpload(uploadId);
    setUploadStatus(`Upload complete: ${completeResult.file.name}`);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadStatus("Upload cancelled");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="file-upload-container">
      <h2>File Upload Service</h2>

      <div className="upload-controls">
        <input type="file" onChange={handleFileChange} disabled={isUploading} />

        <div className="upload-options">
          <label>
            <input
              type="checkbox"
              checked={useChunkedUpload}
              onChange={handleUploadToggle}
              disabled={isUploading}
            />
            Use chunked upload (recommended for large files)
          </label>
        </div>

        {selectedFile && (
          <div className="file-info">
            <strong>Selected file:</strong> {selectedFile.name} (
            {formatFileSize(selectedFile.size)})
          </div>
        )}

        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            Upload
          </button>

          {isUploading && <button onClick={handleCancel}>Cancel</button>}
        </div>

        {isUploading && (
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}

        {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
      </div>

      <div className="file-list-container">
        <h3>Uploaded Files</h3>
        {fileList.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          <table className="file-list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {fileList.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{formatDate(file.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
