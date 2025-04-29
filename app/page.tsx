import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.hero}>
        <h1 className={styles.title}>Discovr</h1>
        <h2 className={styles.subtitle}>PM Insights Engine</h2>
        <Link href="/strategy" className={styles.getStarted}>
          Get Started
        </Link>
      </main>
    </div>
  );
}
