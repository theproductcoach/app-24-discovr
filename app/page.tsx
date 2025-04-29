import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
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
