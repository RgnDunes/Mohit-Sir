import axios from "axios";

const API_URL = "http://localhost:3000";

const buttonhandler = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const getAddition = async (input1, input2) => {
  try {
    const response = await axios.post(`${API_URL}/api/add`, {
      num1: input1,
      num2: input2,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching addition:", error);
    throw error;
  }
};

const getSubtraction = async (input1, input2) => {
  try {
    const response = await axios.get(`${API_URL}/api/subtract`, {
      params: {
        num1: input1,
        num2: input2,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subtraction:", error);
    throw error;
  }
};

// Simple file upload function
const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Functions for chunked file upload
const initChunkedUpload = async (fileName, fileSize, totalChunks) => {
  try {
    const response = await axios.post(`${API_URL}/api/upload/init`, {
      fileName,
      fileSize,
      totalChunks,
    });

    return response.data;
  } catch (error) {
    console.error("Error initializing chunked upload:", error);
    throw error;
  }
};

const uploadChunk = async (chunk, uploadId, chunkIndex) => {
  try {
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("uploadId", uploadId);
    formData.append("chunkIndex", chunkIndex);

    const response = await axios.post(`${API_URL}/api/upload/chunk`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading chunk:", error);
    throw error;
  }
};

const completeChunkedUpload = async (uploadId) => {
  try {
    const response = await axios.post(`${API_URL}/api/upload/complete`, {
      uploadId,
    });

    return response.data;
  } catch (error) {
    console.error("Error completing chunked upload:", error);
    throw error;
  }
};

const getFilesList = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/files`);
    return response.data;
  } catch (error) {
    console.error("Error getting files list:", error);
    throw error;
  }
};

export {
  buttonhandler,
  getAddition,
  getSubtraction,
  uploadFile,
  initChunkedUpload,
  uploadChunk,
  completeChunkedUpload,
  getFilesList,
};
