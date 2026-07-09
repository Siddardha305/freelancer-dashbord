"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./PortfolioGrid.module.css";
import ScrollReveal from "./ScrollReveal";

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  client: string;
  year: string;
}

export default function PortfolioGrid({ projects = [] }: { projects?: Project[] }) {
  const [activeFilter, setActiveFilter] = useState("thumbnails");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filters = [
    { id: "thumbnails", label: "Thumbnails" },
    { id: "posters", label: "Posters" },
    { id: "branding", label: "Wedding Countdown" },
  ];

  const filteredProjects = projects.filter((project) => project.category === activeFilter);

  return (
    <section id="portfolio" className={styles.portfolioSection}>
      <div className="container">
        <ScrollReveal direction="up">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTag}>CREATIVE PORTFOLIO</p>
            <h2 className={styles.sectionTitle}>Featured Projects</h2>
          </div>
        </ScrollReveal>

        {/* Filter Navigation */}
        <ScrollReveal direction="up" delay={100}>
          <div className={styles.filterTabs}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.activeFilter : ""}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Projects Grid */}
        <div className={styles.grid}>
          {filteredProjects.map((project, idx) => (
            <ScrollReveal key={project.id} direction="up" delay={(idx % 2) * 150}>
              <div
                className={styles.card}
                onClick={() => setSelectedProject(project)}
              >
                <div className={`${styles.imageWrapper} ${styles[project.category]}`}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.projectImg}
                  />
                  <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                      <span className={styles.projectCategory}>{project.category}</span>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <div className={styles.viewBadge}>
                        <span>View Project</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedProject && (
        <div className={styles.modal} onClick={() => setSelectedProject(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedProject(null)} aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className={styles.modalBody}>
              <div className={styles.modalImageWrapper}>
                <Image
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  width={800}
                  height={500}
                  className={styles.modalImg}
                />
              </div>
              <div className={styles.modalDetails}>
                <span className={styles.modalCategory}>{selectedProject.category}</span>
                <h3 className={styles.modalTitle}>{selectedProject.title}</h3>
                <p className={styles.modalDesc}>{selectedProject.description}</p>
                <div className={styles.modalMetaGrid}>
                  <div className={styles.metaBox}>
                    <span className={styles.metaLabel}>Client</span>
                    <span className={styles.metaValue}>{selectedProject.client}</span>
                  </div>
                  <div className={styles.metaBox}>
                    <span className={styles.metaLabel}>Year</span>
                    <span className={styles.metaValue}>{selectedProject.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
