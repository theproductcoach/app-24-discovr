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

export default function StrategyPage() {
  const [strategy, setStrategy] = useState("");
  const [metrics, setMetrics] = useState<string[]>(DEFAULT_METRICS);
  const [saveMessage, setSaveMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
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
  }, []);

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
            <h1 className={styles.heading}>Product Strategy & Objectives</h1>
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
          <h1 className={styles.heading}>Product Strategy & Objectives</h1>
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

      <div className={styles.card}>{renderContent()}</div>
    </div>
  );
}
