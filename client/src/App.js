import "./App.css";
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import "./components/FileUpload.css";

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>File Upload Service</h1>
        <p>Upload files with support for large file chunking</p>
      </header>
      <main>
        <FileUpload />
      </main>
      <footer className="App-footer">
        <p>File Upload Service - Interview Project</p>
      </footer>
    </div>
  );
}
