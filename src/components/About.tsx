"use client";

import styles from "./About.module.css";
import ScrollReveal from "./ScrollReveal";

export default function About() {
  const skills = [
    { name: "Adobe Photoshop", percentage: 95 },
    { name: "Adobe Illustrator", percentage: 30 },
    { name: "Adobe Premiere Pro", percentage: 80 },
  ];

  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container">
        <ScrollReveal direction="up">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTag}>KNOW ME BETTER</p>
            <h2 className={styles.sectionTitle}>About & Skills</h2>
          </div>
        </ScrollReveal>

        <div className={styles.bentoGrid}>
          {/* About Me Card */}
          <ScrollReveal direction="up" delay={50} className={styles.cardAbout}>
            <div className={styles.bentoCard}>
              <h3 className={styles.cardTitle}>Who I Am</h3>
              <p className={styles.aboutText}>
                I am a passionate <strong>Graphic Designer</strong> with over 4 years of dedicated experience. 
                My expertise lies in crafting high-impact digital experiences, specializing in high-performance YouTube thumbnails, movie posters, and striking social media creatives.
              </p>
              <p className={styles.aboutText}>
                I am known for my dedication, loyalty, and relentless attention to visual detail. I love taking on creative challenges, and have a profound interest in storytelling through visuals, particularly in the film and digital creator industries.
              </p>
              <div className={styles.personalMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaValue}>Andhra Pradesh, India</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Hobbies Card */}
          <ScrollReveal direction="up" delay={200} className={styles.cardHobbies}>
            <div className={styles.bentoCard}>
              <h3 className={styles.cardTitle}>Hobbies & Passions</h3>
              <div className={styles.hobbiesList}>
                <div className={styles.hobbyItem}>
                  <div className={styles.hobbyIcon}>
                    {/* Movie Camera SVG */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="2" y1="7" x2="7" y2="7"></line>
                      <line x1="2" y1="17" x2="7" y2="17"></line>
                      <line x1="17" y1="17" x2="22" y2="17"></line>
                      <line x1="17" y1="7" x2="22" y2="7"></line>
                    </svg>
                  </div>
                  <div className={styles.hobbyInfo}>
                    <h4>Watching Movies</h4>
                    <p>Analyzing cinematic layouts, lighting, color grading, and film posters.</p>
                  </div>
                </div>

                <div className={styles.hobbyItem}>
                  <div className={styles.hobbyIcon}>
                    {/* Camera SVG */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <div className={styles.hobbyInfo}>
                    <h4>Photography</h4>
                    <p>Capturing frames, angles, landscapes, and details to feed creative designs.</p>
                  </div>
                </div>

                <div className={styles.hobbyItem}>
                  <div className={styles.hobbyIcon}>
                    {/* Music SVG */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                  </div>
                  <div className={styles.hobbyInfo}>
                    <h4>Music</h4>
                    <p>Finding rhythm and mood matches that fuel focused design sessions.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Technical Skills Card */}
          <ScrollReveal direction="up" delay={100} className={styles.cardSkills}>
            <div className={styles.bentoCard}>
              <h3 className={styles.cardTitle}>Professional Skills</h3>
              <div className={styles.skillsContainer}>
                {skills.map((skill, idx) => (
                  <div key={idx} className={styles.skillProgressItem}>
                    <div className={styles.skillHeader}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <span className={styles.skillPercentage}>{skill.percentage}%</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Education Card */}
          <ScrollReveal direction="up" delay={250} className={styles.cardEducation}>
            <div className={styles.bentoCard}>
              <h3 className={styles.cardTitle}>Education</h3>
              <div className={styles.educationTimeline}>
                <div className={styles.eduItem}>
                  <span className={styles.eduPeriod}>Completed in 2018</span>
                  <h4 className={styles.eduDegree}>SSC (10th Class)</h4>
                  <p className={styles.eduSchool}>GSR Vidyalaya</p>
                </div>

                <div className={styles.eduItem}>
                  <span className={styles.eduPeriod}>Vocational Training</span>
                  <h4 className={styles.eduDegree}>Industrial Training Institute (ITI)</h4>
                  <p className={styles.eduSchool}>SNRRM ITI (Electrical Specialization)</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
