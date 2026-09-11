import { useEffect, useRef } from "react";
import styles from "./FloatingElements.module.css";
import { Heart, Sparkles, Star, Zap } from "lucide-react";

const PARTICLES = [
  { type: "zap", left: "8%", delay: 0, duration: 12 },
  { type: "star", left: "18%", delay: 2, duration: 15, color: "#8B5CF6" },
  { type: "dot", color: "#5B21B6", size: 8, left: "28%", delay: 4, duration: 10 },
  { type: "zap", left: "38%", delay: 1.5, duration: 13 },
  { type: "star", left: "48%", delay: 3, duration: 16, color: "#22C55E" },
  { type: "dot", color: "#166534", size: 6, left: "58%", delay: 0.5, duration: 11 },
  { type: "zap", left: "68%", delay: 2.5, duration: 14 },
  { type: "star", left: "78%", delay: 1, duration: 12, color: "#8B5CF6" },
  { type: "dot", color: "#7C3AED", size: 10, left: "88%", delay: 3.5, duration: 9 },
  { type: "star", left: "93%", delay: 0.8, duration: 17, color: "#22C55E" },
  { type: "zap", left: "5%", delay: 5, duration: 11 },
  { type: "dot", color: "#A78BFA", size: 7, left: "72%", delay: 6, duration: 13 },
];

export function FloatingElements() {
  return (
    <div className={styles.container} aria-hidden="true">
      {PARTICLES.map((p, i) => {
        const animStyle: React.CSSProperties = {
          left: p.left,
          bottom: "-10%",
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        };

        if (p.type === "dot") {
          return (
            <span
              key={i}
              className={`${styles.particle} ${styles.dot}`}
              style={{
                ...animStyle,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
            />
          );
        }

        if (p.type === "zap") {
          return (
            <span
              key={i}
              className={`${styles.particle} ${styles.zap}`}
              style={animStyle}
            >
              <Zap size={24} color="#5B21B6" />
            </span>
          );
        }

        return (
          <span
            key={i}
            className={`${styles.particle} ${styles.star}`}
            style={{ ...animStyle, color: p.color || "#8B5CF6" }}
          >
            <Star size={20} fill="currentColor" stroke="none" />
          </span>
        );
      })}
    </div>
  );
}