"use client";

import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <a href="#home" className={styles.logo} onClick={closeMobileMenu}>
          RAJESH<span className={styles.logoDot}>.</span>
        </a>

        <button
          className={`${styles.menuBtn} ${mobileMenuOpen ? styles.menuBtnActive : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
          <span className={styles.burgerLine}></span>
        </button>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navActive : ""}`}>
          <a href="#home" className={styles.navLink} onClick={closeMobileMenu}>
            Home
          </a>
          <a href="#about" className={styles.navLink} onClick={closeMobileMenu}>
            About
          </a>
          <a href="#portfolio" className={styles.navLink} onClick={closeMobileMenu}>
            Portfolio
          </a>
          <a href="#experience" className={styles.navLink} onClick={closeMobileMenu}>
            Experience
          </a>
          <a href="#contact" className={styles.navLink} onClick={closeMobileMenu}>
            Contact
          </a>
          <a
            href="#contact"
            className={styles.contactBtn}
            onClick={closeMobileMenu}
          >
            Hire Me
          </a>
        </nav>
      </div>
    </header>
  );
}
