"use client";

import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';

interface AnimatedProgressBarProps {
  value: number; // Percentage value (0-100)
  label: string;
  className?: string;
}

export default function AnimatedProgressBar({ value, label, className }: AnimatedProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start animation when the element is visible
          let currentProgress = 0;
          const targetProgress = value;
          const duration = 1500; // ms
          const increment = targetProgress / (duration / 16); // Assuming 60fps (1000ms/16ms)

          const animate = () => {
            currentProgress += increment;
            if (currentProgress < targetProgress) {
              setProgress(currentProgress);
              requestAnimationFrame(animate);
            } else {
              setProgress(targetProgress);
            }
          };

          // Slight delay before starting animation
          const timer = setTimeout(() => {
            requestAnimationFrame(animate);
          }, 100);

          observer.unobserve(entry.target); // Stop observing once animation starts
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [value]);

  return (
    <div ref={ref} className={className}>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm text-primary font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2 [&>div]:bg-primary" />
    </div>
  );
}
