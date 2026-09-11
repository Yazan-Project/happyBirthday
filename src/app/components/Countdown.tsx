import { useState, useEffect } from "react";
import styles from "./Countdown.module.css";
const EVENT_DATE = new Date("2026-10-24T18:00:00-03:00");

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function getTimeLeft() {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function Countdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className={styles.section}>
      <p className={styles.label}>O grande SMASH começa em</p>
      <div className={styles.grid}>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(time.days)}</span>
          <span className={styles.unitLabel}>dias</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(time.hours)}</span>
          <span className={styles.unitLabel}>horas</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(time.minutes)}</span>
          <span className={styles.unitLabel}>minutos</span>
        </div>
        <span className={styles.separator}>:</span>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(time.seconds)}</span>
          <span className={styles.unitLabel}>segundos</span>
        </div>
      </div>
    </section>
  );
}