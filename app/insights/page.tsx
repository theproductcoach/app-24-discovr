"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/styles/insights.module.css";
import InsightsChat from "@/app/components/InsightsChat";

interface SavedData {
  strategy: string;
  metrics: string[];
  data: string;
}

export default function InsightsPage() {
  const [savedData, setSavedData] = useState<SavedData>({
    strategy: "",
    metrics: [],
    data: "",
  });
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

    setSavedData({ strategy, metrics, data });
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
                  {savedData.data || "No data saved yet"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
