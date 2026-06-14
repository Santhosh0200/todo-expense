import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  /** Formats the (interpolated) number into a display string. */
  format?: (n: number) => string;
}

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) =>
    format ? format(latest) : Math.round(latest).toLocaleString("en-IN"),
  );

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: 0.6, ease: "easeOut" });
    return () => controls.stop();
  }, [value, reduce, motionValue]);

  return <motion.span>{display}</motion.span>;
}
