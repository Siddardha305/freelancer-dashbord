"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Hero.module.css";

const titles = [
  "Thumbnail Designer",
  "Brand Creator",
  "Visual Storyteller",
  "Creative Freelancer"
];

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  
  const titleIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    let typingSpeed = 100;
    
    const handleType = () => {
      const currentTitle = titles[titleIndexRef.current];
      
      if (isDeletingRef.current) {
        setTypedText(currentTitle.substring(0, charIndexRef.current - 1));
        charIndexRef.current--;
        typingSpeed = 50;
      } else {
        setTypedText(currentTitle.substring(0, charIndexRef.current + 1));
        charIndexRef.current++;
        typingSpeed = 100;
      }

      if (!isDeletingRef.current && charIndexRef.current === currentTitle.length) {
        isDeletingRef.current = true;
        typingSpeed = 2000;
      } else if (isDeletingRef.current && charIndexRef.current === 0) {
        isDeletingRef.current = false;
        titleIndexRef.current = (titleIndexRef.current + 1) % titles.length;
        typingSpeed = 500;
      }

      setTimeout(handleType, typingSpeed);
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, []);

  const [mousePosition, setMousePosition] = useState({ x: -500, y: -500 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      id="home" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={styles.heroSection}
    >
      <div 
        className={styles.glowBg}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />
      
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.introTag}>HI, I AM RAJESH VASUKURI</p>
          <h1 className={styles.mainTitle}>
            Bringing Ideas to <span className={styles.gradientText}>Visual Reality</span>
          </h1>
          <h2 className={styles.subtitle}>
            I am a <span className={styles.typedText}>{typedText}</span>
            <span className={styles.cursor}>|</span>
          </h2>
          <p className={styles.description}>
            With 4+ years of professional experience, I help YouTubers, brands, and content creators capture audience attention with high-conversion thumbnails, professional posters, and striking visual branding.
          </p>
          <div className={styles.ctaGroup}>
            <a href="#portfolio" className={styles.primaryCta}>
              View My Work
            </a>
            <a href="#contact" className={styles.secondaryCta}>
              Get In Touch
            </a>
          </div>
        </div>

        <div className={styles.imageWrapper}>
          <div className={styles.imageFrame}>
            <div className={styles.backRing}></div>
            <Image
              src="/main-image1 .jpeg"
              alt="Rajesh Vasukuri"
              width={350}
              height={350}
              priority
              className={styles.profileImg}
            />
            <div className={styles.frameDecoration1}></div>
            <div className={styles.frameDecoration2}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
