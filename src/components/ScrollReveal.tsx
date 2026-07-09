"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import styles from "./ScrollReveal.module.css";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade";
  delay?: number;
  duration?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 800,
  className = "",
}: ScrollRevealProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const getDirectionClass = () => {
    switch (direction) {
      case "up":
        return styles.revealUp;
      case "down":
        return styles.revealDown;
      case "left":
        return styles.revealLeft;
      case "right":
        return styles.revealRight;
      case "fade":
        return styles.revealFade;
      default:
        return styles.revealUp;
    }
  };

  return (
    <div
      ref={ref}
      className={`${styles.revealContainer} ${isIntersecting ? styles.active : ""} ${getDirectionClass()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
