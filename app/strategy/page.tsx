"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/strategy.module.css";
import Navbar from "@/app/components/Navbar";

const PLACEHOLDER_STRATEGY = `We are building a self-serve insights platform to help product managers synthesise strategy, data, and user feedback into actionable next steps. Our goal is to reduce decision-making friction and speed up iteration cycles across product teams.`;

const DEFAULT_METRICS = [
  "Increase weekly active PMs by 30% within 3 months",
  "Reduce time-to-insight for PMs by 50%",
  "Maintain >85% satisfaction on usability surveys",
];

// Sample demo data (consistent across pages)
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

export default function StrategyPage() {
  const [strategy, setStrategy] = useState("");
  const [metrics, setMetrics] = useState<string[]>(DEFAULT_METRICS);
  const [saveMessage, setSaveMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    // Check if demo mode was previously enabled
    const isDemoEnabled = localStorage.getItem("discovr_demo_mode") === "true";
    setDemoMode(isDemoEnabled);

    if (isDemoEnabled) {
      // If demo mode is enabled, ensure we're showing demo data
      setStrategy(DEMO_STRATEGY);
      setMetrics(DEMO_METRICS);
      setHasExistingData(true);
      setIsEditing(false);

      // Ensure localStorage has the correct values
      localStorage.setItem("discovr_strategy", DEMO_STRATEGY);
      localStorage.setItem("discovr_metrics", JSON.stringify(DEMO_METRICS));

      // Demo data for related pages
      localStorage.setItem("discovr_data", DEMO_DATA);

      // Demo file data
      localStorage.setItem(
        "discovr_uploaded_files_meta",
        JSON.stringify([DEMO_FILE])
      );
    } else {
      // Load saved data if not in demo mode
      const savedStrategy = localStorage.getItem("discovr_strategy");
      const savedMetrics = localStorage.getItem("discovr_metrics");

      if (savedStrategy) setStrategy(savedStrategy);
      if (savedMetrics) {
        try {
          const parsedMetrics = JSON.parse(savedMetrics);
          setMetrics(parsedMetrics);
        } catch {
          // If parsing fails, use default metrics
          setMetrics(DEFAULT_METRICS);
        }
      }

      // Set hasExistingData if either field has content
      setHasExistingData(!!(savedStrategy || savedMetrics));
      // Start in edit mode if no existing data
      setIsEditing(!(savedStrategy || savedMetrics));
    }
  }, []);

  // Toggle demo mode function
  const toggleDemoMode = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);

    // Store demo mode state in localStorage
    localStorage.setItem("discovr_demo_mode", newDemoMode.toString());

    if (newDemoMode) {
      // Enable demo mode with sample data
      localStorage.setItem("discovr_strategy", DEMO_STRATEGY);
      localStorage.setItem("discovr_metrics", JSON.stringify(DEMO_METRICS));
      localStorage.setItem("discovr_data", DEMO_DATA);

      // Update local state
      setStrategy(DEMO_STRATEGY);
      setMetrics(DEMO_METRICS);
      setHasExistingData(true);
      setIsEditing(false);

      // Add demo file
      localStorage.setItem(
        "discovr_uploaded_files_meta",
        JSON.stringify([DEMO_FILE])
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
    } else {
      // Disable demo mode - clear localStorage
      localStorage.removeItem("discovr_strategy");
      localStorage.removeItem("discovr_metrics");
      localStorage.removeItem("discovr_data");
      localStorage.removeItem("discovr_uploaded_files_meta");
      localStorage.removeItem("discovr_uploaded_files");

      // Reset state to default
      setStrategy("");
      setMetrics(DEFAULT_METRICS);
      setHasExistingData(false);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    localStorage.setItem("discovr_strategy", strategy);
    localStorage.setItem("discovr_metrics", JSON.stringify(metrics));

    setSaveMessage("Saved!");
    setIsEditing(false);
    setHasExistingData(true);

    // Clear message after 2 seconds
    setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  };

  const addMetric = () => {
    setMetrics([...metrics, ""]);
  };

  const updateMetric = (index: number, value: string) => {
    const newMetrics = [...metrics];
    newMetrics[index] = value;
    setMetrics(newMetrics);
  };

  const removeMetric = (index: number) => {
    const newMetrics = metrics.filter((_, i) => i !== index);
    setMetrics(newMetrics);
  };

  const renderMetricsInput = () => (
    <div className={styles.metricsInputContainer}>
      {metrics.map((metric, index) => (
        <div key={index} className={styles.metricRow}>
          <input
            type="text"
            value={metric}
            onChange={(e) => updateMetric(index, e.target.value)}
            placeholder={`Metric ${index + 1}`}
            className={styles.metricInput}
          />
          {metrics.length > 1 && (
            <button
              onClick={() => removeMetric(index)}
              className={styles.removeMetricButton}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button onClick={addMetric} className={styles.addMetricButton}>
        + Add More Metrics
      </button>
    </div>
  );

  const renderMetricsDisplay = () => (
    <div className={styles.metricsDisplayContainer}>
      {metrics.map((metric, index) => (
        <div key={index} className={styles.metricDisplayRow}>
          <span className={styles.metricBullet}>•</span>
          <span className={styles.metricText}>{metric}</span>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (!hasExistingData || isEditing) {
      return (
        <>
          <section className={styles.section}>
            <textarea
              className={styles.textarea}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder={PLACEHOLDER_STRATEGY}
            />
          </section>

          <section className={styles.section}>
            <h2 className={styles.subheading}>Success Metrics</h2>
            {renderMetricsInput()}
          </section>

          <section className={styles.section}>
            <div className={styles.saveContainer}>
              <button className={styles.button} onClick={handleSave}>
                Save Strategy
              </button>
              {saveMessage && (
                <span className={styles.saveMessage}>{saveMessage}</span>
              )}
            </div>
          </section>
        </>
      );
    }

    return (
      <>
        <section className={styles.section}>
          <div className={styles.content}>{strategy}</div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subheading}>Success Metrics</h2>
          {renderMetricsDisplay()}
        </section>

        <section className={styles.section}>
          <button className={styles.button} onClick={() => setIsEditing(true)}>
            Edit Strategy
          </button>
        </section>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.card}>
        {/* Demo Mode Toggle and heading in consistent layout */}
        <div className={styles.pageHeader}>
          <h1 className={styles.heading}>Product Strategy & Objectives</h1>
          <div className={styles.demoToggleContainer}>
            <label htmlFor="strategyDemoMode" className={styles.demoModeLabel}>
              Demo Mode
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="strategyDemoMode"
                  checked={demoMode}
                  onChange={toggleDemoMode}
                  className={styles.toggleInput}
                />
                <span className={styles.toggleSlider}></span>
              </div>
            </label>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
