"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  animationClassName?: string; // Kept for backwards compatibility if used elsewhere
  delay?: number; // Switched to a number in seconds for framer-motion, defaults to 0.1
  threshold?: number;
}

export default function ScrollAnimationWrapper({
  children,
  className,
  animationClassName,
  delay = 0,
  threshold = 0.1,
}: ScrollAnimationWrapperProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const { isAdmin } = useAdmin();

  // If we are in Admin Mode, disable animations so they don't interfere with editing
  if (isAdmin) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0.001, y: 50, filter: "blur(10px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0.001, y: 50, filter: "blur(10px)" }
      }
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Custom Framer-like spring/easing
      }}
    >
      {children}
    </motion.div>
  );
}
