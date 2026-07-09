"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPosition, setTrailingPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const trailingRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Check if it's a touch device or mobile
    const checkDevice = () => {
      const isTouch = window.matchMedia("(hover: none)").matches || 
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isTouch);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsHidden(false);
      targetRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    // Smooth trailing ring using RequestAnimationFrame
    const updateTrailing = () => {
      const dx = targetRef.current.x - trailingRef.current.x;
      const dy = targetRef.current.y - trailingRef.current.y;
      
      // Interpolate position (lerp)
      trailingRef.current.x += dx * 0.15;
      trailingRef.current.y += dy * 0.15;

      setTrailingPosition({ x: trailingRef.current.x, y: trailingRef.current.y });
      animationFrameId.current = requestAnimationFrame(updateTrailing);
    };

    // Hover state detection
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("a") || 
        target.closest("button") || 
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.classList.contains("clickable") ||
        target.closest(`[class*="card"]`);

      setIsHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    animationFrameId.current = requestAnimationFrame(updateTrailing);

    // Add cursor none class to html
    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isMobile]);

  if (isMobile || isHidden) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        className={`${styles.cursorDot} ${isHovered ? styles.cursorDotHover : ""} ${isClicking ? styles.cursorDotClick : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Outer Ring */}
      <div
        className={`${styles.cursorRing} ${isHovered ? styles.cursorRingHover : ""} ${isClicking ? styles.cursorRingClick : ""}`}
        style={{
          left: `${trailingPosition.x}px`,
          top: `${trailingPosition.y}px`,
        }}
      />
    </>
  );
}
