"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/data.module.css";

export default function DataPage() {
  const [data, setData] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("discovr_data");
    if (savedData) {
      setData(savedData);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("discovr_data", data);
    setSaveMessage("Saved!");

    // Clear message after 2 seconds
    setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      // File reading logic will be implemented later
    }
  };

  const handleGenerateQuestions = () => {
    console.log("Generating suggested questions...");
    // Question generation logic will be implemented later
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/strategy" className={styles.navLink}>
            Strategy
          </Link>
          <Link href="/data" className={styles.navLink}>
            Data
          </Link>
          <Link href="/insights" className={styles.navLink}>
            Insights
          </Link>
        </div>
      </nav>

      <div className={styles.card}>
        <h1 className={styles.heading}>📂 Upload Your Data</h1>

        <div className={styles.inputContainer}>
          <div className={styles.inputSection}>
            <h2 className={styles.subheading}>Paste Text</h2>
            <textarea
              className={styles.textarea}
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Paste your notes, transcripts, A/B test results, or research snippets here..."
            />
          </div>

          <div className={styles.inputSection}>
            <h2 className={styles.subheading}>Upload File</h2>
            <div className={styles.fileUploadContainer}>
              <input
                type="file"
                id="file-upload"
                className={styles.fileInput}
                accept=".txt,.csv,.pdf"
                onChange={handleFileUpload}
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
          </div>
        </div>

        <div className={styles.saveContainer}>
          <button className={styles.button} onClick={handleSave}>
            Save Data
          </button>
          {saveMessage && (
            <span className={styles.saveMessage}>{saveMessage}</span>
          )}
        </div>

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
