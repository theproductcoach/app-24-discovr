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

// Sample demo data
const DEMO_STRATEGY = "Our product helps recent computer science graduates land their first tech job by identifying skill gaps and matching them with personalised interview prep and micro-assessments. Our goal is to reduce the average job search time for junior candidates.";

const DEMO_METRICS = [
  "Increase assessment completion rate to 70%",
  "Reduce dropout between signup and first interview by 30%",
  "Boost candidate-to-hire ratio from 8% to 12%",
  "Improve average job offer timeline from 8 weeks to 5 weeks"
];

const DEMO_DATA = `User Interview Highlights:
- "I didn't realise I was halfway through. Some kind of progress bar would help."
- "The technical questions felt good, but I wasn't sure how well I did."
- "I dropped off because I didn't get any feedback after the first few questions."

Support Tickets & Themes:
- Repeated requests for saving partial progress
- Confusion around the skill categories
- Several users asked for practice sessions before full assessments

A/B Test Results:
- Guided onboarding flow vs standard: 21% increase in completion
- Adding a short dashboard summary after first 3 questions: 17% drop in bounce
- Email reminders led to 14% higher return rate within 48 hours

Product Usage Data:
- Average user attempts 1.3 assessments
- 56% of users stop before finishing their first full one
- Average time on site: 6m 42s`;

const DEMO_FILE = {
  fileId: "demo_file_001",
  filename: "demo_research_notes.txt",
  content: "This is a demo file with research notes for testing the file upload functionality."
};

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
  const [demoMode, setDemoMode] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    // Check if demo mode was previously enabled
    const isDemoEnabled = localStorage.getItem("discovr_demo_mode") === "true";
    setDemoMode(isDemoEnabled);

    if (isDemoEnabled) {
      // If demo mode is enabled, ensure we're showing the demo data
      setSavedData({
        strategy: DEMO_STRATEGY,
        metrics: DEMO_METRICS,
        data: DEMO_DATA,
      });
      setUploadedFiles([DEMO_FILE]);

      // Auto-expand all sections to show demo data
      setExpandedSections({
        strategy: true,
        metrics: true,
        data: true,
      });

      // Ensure localStorage has the correct values
      localStorage.setItem("discovr_strategy", DEMO_STRATEGY);
      localStorage.setItem("discovr_metrics", JSON.stringify(DEMO_METRICS));
      localStorage.setItem("discovr_data", DEMO_DATA);
      localStorage.setItem(
        "discovr_uploaded_files_meta",
        JSON.stringify([DEMO_FILE])
      );
    } else {
      // Load saved data from localStorage if not in demo mode
      const strategy = localStorage.getItem("discovr_strategy") || "";
      const metrics = JSON.parse(
        localStorage.getItem("discovr_metrics") || "[]"
      );
      const data = localStorage.getItem("discovr_data") || "";
      const files = JSON.parse(
        localStorage.getItem("discovr_uploaded_files_meta") || "[]"
      );

      setSavedData({ strategy, metrics, data });
      setUploadedFiles(files);
    }
  }, []);

  // Handle toggling demo mode
  const toggleDemoMode = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);

    // Store demo mode state in localStorage
    localStorage.setItem("discovr_demo_mode", newDemoMode.toString());

    if (newDemoMode) {
      // Enable demo mode - save demo data to localStorage
      localStorage.setItem("discovr_strategy", DEMO_STRATEGY);
      localStorage.setItem("discovr_metrics", JSON.stringify(DEMO_METRICS));
      localStorage.setItem("discovr_data", DEMO_DATA);

      // Add demo file
      const demoFiles = [DEMO_FILE];
      localStorage.setItem(
        "discovr_uploaded_files_meta",
        JSON.stringify(demoFiles)
      );

      // Create a mock file structure for the demo file
      const demoFileContent = DEMO_FILE.content;
      const demoFileBlob = new Blob([demoFileContent], { type: "text/plain" });
      const demoFilesList = [
        {
          fileId: DEMO_FILE.fileId,
          file: demoFileBlob,
          filename: DEMO_FILE.filename,
        },
      ];
      localStorage.setItem(
        "discovr_uploaded_files",
        JSON.stringify(demoFilesList)
      );

      // Update state
      setSavedData({
        strategy: DEMO_STRATEGY,
        metrics: DEMO_METRICS,
        data: DEMO_DATA,
      });
      setUploadedFiles(demoFiles);

      // Auto-expand all sections to show demo data
      setExpandedSections({
        strategy: true,
        metrics: true,
        data: true,
      });
    } else {
      // Disable demo mode - clear localStorage
      localStorage.removeItem("discovr_strategy");
      localStorage.removeItem("discovr_metrics");
      localStorage.removeItem("discovr_data");
      localStorage.removeItem("discovr_uploaded_files_meta");
      localStorage.removeItem("discovr_uploaded_files");

      // Reset state
      setSavedData({
        strategy: "",
        metrics: [],
        data: "",
      });
      setUploadedFiles([]);
    }
  };

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
        {/* Demo mode toggle moved to top-right corner, above heading */}
        <div className={styles.pageHeader}>
          <h1 className={styles.heading}>🔍 Generate Insights</h1>
          <div className={styles.demoToggleContainer}>
            <label htmlFor="insightsDemoMode" className={styles.demoModeLabel}>
              Demo Mode
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="insightsDemoMode"
                  checked={demoMode}
                  onChange={toggleDemoMode}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider}></span>
              </div>
            </label>
          </div>
        </div>

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
