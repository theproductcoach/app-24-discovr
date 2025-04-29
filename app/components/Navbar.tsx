"use client";

import Link from "next/link";
import styles from "@/styles/insights.module.css";

export default function Navbar() {
  return (
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
  );
}
