# File Upload Service

A full-stack JavaScript application that demonstrates file uploading with support for large files through chunked uploads.

## Features

- Simple file upload for small files
- Chunked file upload for large files with progress tracking
- File listing with size and upload date
- Cancel upload functionality
- Responsive UI

## Technical Implementation

### Backend (Node.js/Express)

- RESTful API endpoints for file operations
- Support for both regular and chunked uploads
- File storage management
- Error handling

### Frontend (React)

- Intuitive file upload interface
- Progress bar for tracking uploads
- Automatic detection of large files
- Responsive design

## Project Setup

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone this repository
2. Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running the Application

You need to start both the backend and frontend servers:

#### Start the Backend Server

```bash
cd api
npm start
```

This will start the backend server on http://localhost:3000.

#### Start the Frontend Server

```bash
cd client
npm start
```

This will start the frontend server on http://localhost:3001 and automatically open it in your default browser.

## How to Use

1. Open the application in your browser (http://localhost:3001)
2. Click "Choose File" to select a file to upload
3. For files larger than 5MB, chunked upload will be automatically selected
4. Click "Upload" to start the upload process
5. Monitor the progress bar for upload status
6. View the list of uploaded files below

## Implementation Details

### Chunked Upload Process

1. Frontend splits large files into smaller chunks (1MB each)
2. Backend creates a temporary directory for each upload
3. Chunks are uploaded one by one with progress tracking
4. After all chunks are uploaded, they are combined into the final file
5. Temporary chunks are cleaned up

### Error Handling

- Backend validates all requests and sends appropriate error responses
- Frontend displays user-friendly error messages
- Upload can be cancelled at any time

## Development Notes

This project was built with:

- React 19.0.0
- Express 4.16.1
- Multer for file uploads
- Axios for HTTP requests
