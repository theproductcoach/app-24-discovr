"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/insights.module.css";
import InsightsChat from "../components/InsightsChat";
import Navbar from "@/app/components/Navbar";

interface SavedData {
  strategy: string;
  metrics: string[];
  data: string;
}

interface UploadedFile {
  fileId: string;
  filename: string;
}

export default function InsightsPage() {
  const [savedData, setSavedData] = useState<SavedData>({
    strategy: "",
    metrics: [],
    data: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    strategy: false,
    metrics: false,
    data: false,
  });

  // Load saved data on component mount
  useEffect(() => {
    const strategy = localStorage.getItem("discovr_strategy") || "";
    const metrics = JSON.parse(localStorage.getItem("discovr_metrics") || "[]");
    const data = localStorage.getItem("discovr_data") || "";
    const files = JSON.parse(
      localStorage.getItem("discovr_uploaded_files_meta") || "[]"
    );

    setSavedData({ strategy, metrics, data });
    setUploadedFiles(files);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.content}>
        <h1 className={styles.heading}>🔍 Generate Insights</h1>

        <div className={styles.chatSection}>
          <InsightsChat />
        </div>

        <div className={styles.sectionsCard}>
          <div className={styles.sectionsContainer}>
            {/* Strategy Section */}
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("strategy")}
              >
                <h2 className={styles.sectionTitle}>
                  Product Strategy & Objectives
                </h2>
                <span className={styles.toggleIcon}>
                  {expandedSections.strategy ? "−" : "+"}
                </span>
              </div>
              {expandedSections.strategy && (
                <div className={styles.sectionContent}>
                  {savedData.strategy || "No strategy saved yet"}
                </div>
              )}
            </div>

            {/* Metrics Section */}
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("metrics")}
              >
                <h2 className={styles.sectionTitle}>Success Metrics</h2>
                <span className={styles.toggleIcon}>
                  {expandedSections.metrics ? "−" : "+"}
                </span>
              </div>
              {expandedSections.metrics && (
                <div className={styles.sectionContent}>
                  {savedData.metrics.length > 0 ? (
                    <ul className={styles.metricsList}>
                      {savedData.metrics.map((metric, index) => (
                        <li key={index} className={styles.metricItem}>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No metrics saved yet"
                  )}
                </div>
              )}
            </div>

            {/* Data Section */}
            <div className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection("data")}
              >
                <h2 className={styles.sectionTitle}>Research & Data</h2>
                <span className={styles.toggleIcon}>
                  {expandedSections.data ? "−" : "+"}
                </span>
              </div>
              {expandedSections.data && (
                <div className={styles.sectionContent}>
                  <div className={styles.dataContent}>
                    {savedData.data && (
                      <div className={styles.dataText}>{savedData.data}</div>
                    )}
                    <div className={styles.uploadedFiles}>
                      <h3 className={styles.uploadedFilesTitle}>
                        Uploaded Files:
                      </h3>
                      {uploadedFiles.length > 0 ? (
                        <ul className={styles.filesList}>
                          {uploadedFiles.map((file, index) => (
                            <li key={index} className={styles.fileItem}>
                              📄 {file.filename}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.noFiles}>No files uploaded yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
