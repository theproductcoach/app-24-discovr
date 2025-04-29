"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/data.module.css";
import Navbar from "@/app/components/Navbar";

interface UploadedFile {
  fileId: string;
  filename: string;
}

export default function DataPage() {
  const [data, setData] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pendingUpload, setPendingUpload] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved data and files on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("discovr_data");
    const savedFiles = localStorage.getItem("discovr_uploaded_files");
    if (savedData) {
      setData(savedData);
    }
    if (savedFiles) {
      try {
        setUploadedFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error("Error parsing saved files:", error);
      }
    }
  }, []);

  const showMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [".txt", ".csv", ".pdf"];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(fileExtension.toLowerCase())) {
      showMessage("Invalid file type");
      return;
    }

    setSelectedFile(file);
    setPendingUpload(file.name);
    // Reset file input
    event.target.value = "";
  };

  const handleGenerateQuestions = () => {
    console.log("Generating suggested questions...");
    // Question generation logic will be implemented later
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [".txt", ".csv", ".pdf"];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(fileExtension.toLowerCase())) {
      showMessage("Invalid file type");
      return;
    }

    setSelectedFile(file);
    setPendingUpload(file.name);
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.card}>
        <h1 className={styles.heading}>📂 Upload Your Data</h1>

        <div className={styles.inputSection}>
          <h2 className={styles.subheading}>Paste Text</h2>
          <textarea
            className={styles.textarea}
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Paste your notes, transcripts, A/B test results, or research snippets here..."
            disabled={isLoading}
          />
          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${styles.clearButton}`}
              onClick={() => setData("")}
              disabled={isLoading || !data.trim()}
            >
              Clear Text
            </button>
            <button
              className={styles.button}
              onClick={async () => {
                if (!data.trim()) return;
                setIsLoading(true);
                try {
                  // Save to localStorage
                  localStorage.setItem("discovr_data", data);

                  // Get existing threadId from localStorage
                  const threadId = localStorage.getItem("discovr_thread_id");

                  // Send to OpenAI
                  const response = await fetch("/api/data/save-text", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      text: data,
                      threadId,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to save text");
                  }

                  const result = await response.json();

                  // Save new threadId if one was created
                  if (result.threadId) {
                    localStorage.setItem("discovr_thread_id", result.threadId);
                  }

                  showMessage("Text Saved!");
                } catch (error) {
                  console.error("Error saving text:", error);
                  showMessage("Error saving text");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !data.trim()}
            >
              Save Text
            </button>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.inputSection}>
          <h2 className={styles.subheading}>Upload File</h2>
          <div
            className={`${styles.fileUploadContainer} ${
              isDragging ? styles.dragging : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className={styles.fileInput}
              accept=".txt,.csv,.pdf"
              onChange={handleFileSelect}
              disabled={isLoading}
            />
            <label htmlFor="file-upload" className={styles.fileUploadLabel}>
              <span className={styles.fileUploadText}>
                Choose a file or drag it here
              </span>
              <span className={styles.fileUploadHint}>
                Supports .txt, .csv, or .pdf files
              </span>
            </label>
          </div>
          {pendingUpload && (
            <div className={styles.pendingUpload}>
              <span className={styles.fileIcon}>📄</span>
              <span className={styles.fileName}>{pendingUpload}</span>
              <span className={styles.uploadStatus}>Pending</span>
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className={styles.uploadedFiles}>
              <h3 className={styles.uploadedFilesHeading}>Recent Uploads:</h3>
              <div className={styles.filesList}>
                {uploadedFiles.slice(-3).map((file) => (
                  <div key={file.fileId} className={styles.fileItem}>
                    <span className={styles.fileIcon}>📄</span>
                    <span className={styles.fileName}>{file.filename}</span>
                    <span className={styles.uploadStatus}>✓ Uploaded</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={styles.buttonContainer}>
            <button
              className={styles.button}
              onClick={async () => {
                if (!selectedFile) return;
                setIsLoading(true);
                try {
                  const formData = new FormData();
                  formData.append("file", selectedFile);

                  const response = await fetch("/api/data/upload-file", {
                    method: "POST",
                    body: formData,
                  });

                  if (!response.ok) {
                    throw new Error("Failed to upload file");
                  }

                  const result = await response.json();

                  // Add to uploaded files list
                  const newFile = {
                    fileId: result.fileId,
                    filename: result.filename,
                  };

                  const updatedFiles = [...uploadedFiles, newFile];
                  setUploadedFiles(updatedFiles);

                  // Save to localStorage
                  localStorage.setItem(
                    "discovr_uploaded_files",
                    JSON.stringify(updatedFiles)
                  );

                  // Clear the selected file and pending upload
                  setSelectedFile(null);
                  setPendingUpload(null);

                  showMessage("File Uploaded!");
                } catch (error) {
                  console.error("Error uploading file:", error);
                  showMessage("Error uploading file");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !selectedFile}
            >
              Upload File
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className={styles.saveMessageContainer}>
            <span className={styles.saveMessage}>{saveMessage}</span>
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.helpSection}>
          <h2 className={styles.helpHeading}>
            🧪 Help Me Design Interviews & Experiments
          </h2>
          <p className={styles.helpText}>
            Not sure what data to capture? Let Discovr guide you.
          </p>
          <button
            className={`${styles.button} ${styles.generateButton}`}
            onClick={handleGenerateQuestions}
          >
            Generate Interview Questions
          </button>
        </div>
      </div>
    </div>
  );
}
