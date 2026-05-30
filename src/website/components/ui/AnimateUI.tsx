'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';

// 1. Ripple Button Component
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function RippleButton({ children, className = '', ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    if (props.onClick) {
      props.onClick(e);
    }
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <button
      {...props}
      onClick={handleOnClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: ripple.y,
              left: ripple.x,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.35)',
            }}
          />
        ))}
      </span>
    </button>
  );
}

// 2. Liquid Button Component
export function LiquidButton({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-full px-8 py-4 font-bold text-white transition-transform duration-300 active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/20 ${className}`}
    >
      {/* Morphing Liquid SVG background */}
      <div className="absolute inset-0 -z-10 bg-indigo-600 transition-colors duration-300 group-hover:bg-indigo-700" />
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none -z-10 opacity-70 transition-transform duration-500 group-hover:scale-110"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          animate={{
            d: isHovered
              ? "M0,0 C30,10 70,5 100,0 L100,100 C70,95 30,90 0,100 Z"
              : "M0,0 C40,0 60,0 100,0 L100,100 C60,100 40,100 0,100 Z"
          }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          fill="rgba(99, 102, 241, 0.5)"
        />
      </svg>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

// 3. Interactive Icon Component (Micro-animations on Lucide Icons)
interface InteractiveIconProps {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  animation?: 'spin' | 'bounce' | 'shake' | 'slide-x' | 'scale';
}

export function InteractiveIcon({ icon: Icon, className = '', animation = 'scale' }: InteractiveIconProps) {
  const getVariants = (): any => {
    switch (animation) {
      case 'spin':
        return { hover: { rotate: 360, transition: { duration: 0.6, ease: "easeInOut" as const } } };
      case 'bounce':
        return { hover: { y: [0, -6, 0], transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" as const } } };
      case 'shake':
        return { hover: { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.4 } } };
      case 'slide-x':
        return { hover: { x: 4, transition: { type: 'spring' as const, stiffness: 300, damping: 10 } } };
      case 'scale':
      default:
        return { hover: { scale: 1.25, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } } };
    }
  };

  return (
    <motion.div
      whileHover="hover"
      variants={getVariants()}
      className="inline-block shrink-0"
    >
      <Icon className={className} />
    </motion.div>
  );
}

// 4. Animated Card Component (Spotlight & Hover Tilt effect)
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // rgba or hex
}

export function AnimatedCard({ children, className = '', glowColor = 'rgba(99, 102, 241, 0.12)' }: AnimatedCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Background Spotlight layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[inherit]"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 80%)`
        }}
      />
      
      {/* Border Beam light sweep */}
      <div className="absolute inset-0 rounded-[inherit] border border-white/5 pointer-events-none group-hover:border-indigo-500/30 transition-colors duration-300" />
      
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}

// 5. Animated Background Component (Floating stars / particles canvas)
export function AnimatedBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; radius: number; speedX: number; speedY: number; opacity: number }[] = [];

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 60);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.4,
          speedX: (Math.random() - 0.5) * 0.12,
          speedY: (Math.random() - 0.5) * 0.12,
          opacity: Math.random() * 0.4 + 0.15,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${p.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full -z-10 ${className}`}
    />
  );
}

// 6. Animated List Component (Cascading stagger elements)
interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  delayStep?: number;
}

export function AnimatedList({ children, className = '', delayStep = 0.04 }: AnimatedListProps) {
  return (
    <div className={className}>
      <AnimatePresence>
        {React.Children.map(children, (child, idx) => {
          if (!React.isValidElement(child)) return null;
          return (
            <motion.div
              key={child.key || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                delay: idx * delayStep,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
