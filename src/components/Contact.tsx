"use client";

import { useState } from "react";
import styles from "./Contact.module.css";
import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <section id="contact" className={styles.contactSection}>
      <div className="container">
        <ScrollReveal direction="up">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionTag}>GET IN TOUCH</p>
            <h2 className={styles.sectionTitle}>Let&apos;s Connect</h2>
          </div>
        </ScrollReveal>

        <div className={styles.grid}>
          {/* Contact Details Card */}
          <ScrollReveal direction="right" delay={50}>
            <div className={styles.detailsCard}>
              <h3 className={styles.cardTitle}>Contact Info</h3>
              <p className={styles.detailsIntro}>
                Have a project in mind, need a thumbnail designer, or want to collaborate on a film poster? Drop me a message or connect directly!
              </p>

              <div className={styles.infoList}>
                <a href="mailto:designerrajesh63@gmail.com" className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    {/* Mail SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Email Me</span>
                    <span className={styles.infoValue}>designerrajesh63@gmail.com</span>
                  </div>
                </a>

                <a href="tel:+918977439329" className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    {/* Phone SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Call Me</span>
                    <span className={styles.infoValue}>+91 89774 39329</span>
                  </div>
                </a>

                <div className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    {/* Map Pin SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Location</span>
                    <span className={styles.infoValue}>
                      Ganapavaram Mandal, Mupparthipadu,<br/>
                      West Godavari, Andhra Pradesh, 534134
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact Form Card */}
          <ScrollReveal direction="left" delay={150}>
            <div className={styles.formCard}>
              <h3 className={styles.cardTitle}>Send a Message</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Your Email"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Subject"
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Your Message..."
                    className={styles.textarea}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={styles.submitBtn}
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>

                {status === "success" && (
                  <div className={styles.successMessage}>
                    Thanks! Your message has been sent successfully. I will get back to you soon!
                  </div>
                )}
              </form>
            </div>
          </ScrollReveal>
        </div>
        
        {/* Footer info */}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Rajesh Vasukuri. All rights reserved.</p>
          <p className={styles.footerDetail}>Designed & Coded with Excellence.</p>
        </footer>
      </div>
    </section>
  );
}
