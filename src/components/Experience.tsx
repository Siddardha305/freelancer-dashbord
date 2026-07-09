"use client";

import styles from "./Experience.module.css";
import ScrollReveal from "./ScrollReveal";

interface Job {
  period: string;
  title: string;
  description: string;
}

export default function Experience() {
  const experiences: Job[] = [
    {
      period: "2020 - 2022",
      title: "FREELANCE GRAPHIC DESIGNER",
      description: "WORKED WITH MULTIPLE YOUTUBERS ON THUMBNAILS AND SOCIAL MEDIA CREATIVES."
    },
    {
      period: "2022 - 2023",
      title: "FUTURE INDIA ACADEMY",
      description: "DESIGNED POSTERS AND BRANDING MATERIALS FOR ACADEMIC CONTENT."
    },
    {
      period: "2023 - 2024",
      title: "PIXEL MEDIA (YOUTUBER SAI KRISHNA)",
      description: "CREATING HIGH-PERFORMANCE THUMBNAILS, SOCIAL MEDIA POSTERS"
    },
    {
      period: "2025 - PRESENT",
      title: "FOUNDER & DESIGN EDUCATOR",
      description: "Teaching Photoshop, Thumbnail Design, and Creative Skills through courses and social media."
    }
  ];

  return (
    <section id="experience" className={styles.experienceSection}>
      <div className="container">
        <ScrollReveal direction="up">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTag}>MY JOURNEY</p>
            <h2 className={styles.sectionTitle}>Work Experience</h2>
          </div>
        </ScrollReveal>

        <div className={styles.timeline}>
          {experiences.map((exp, idx) => (
            <div key={idx} className={styles.timelineItem}>
              <div className={styles.timelinePoint}>
                <div className={styles.pulseInner}></div>
              </div>
              <ScrollReveal direction="left" delay={idx * 100}>
                <div className={styles.timelineContent}>
                  <span className={styles.period}>{exp.period}</span>
                  <h3 className={styles.role}>{exp.title}</h3>
                  <p className={styles.description}>{exp.description}</p>
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
