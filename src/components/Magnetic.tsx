import { PointerEvent, ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

export function Magnetic({
  children,
  className = "",
  strength = 8
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef<number>();
  const current = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);

  function render() {
    const element = ref.current;

    if (!element) {
      return;
    }

    current.current.x += (target.current.x - current.current.x) * 0.18;
    current.current.y += (target.current.y - current.current.y) * 0.18;

    const deltaX = Math.abs(target.current.x - current.current.x);
    const deltaY = Math.abs(target.current.y - current.current.y);

    if (deltaX < 0.02 && deltaY < 0.02) {
      current.current = { ...target.current };
      element.style.transform = `translate3d(${current.current.x.toFixed(
        2
      )}px, ${current.current.y.toFixed(2)}px, 0)`;
      frame.current = undefined;
      return;
    }

    element.style.transform = `translate3d(${current.current.x.toFixed(
      2
    )}px, ${current.current.y.toFixed(2)}px, 0)`;
    frame.current = requestAnimationFrame(render);
  }

  function start() {
    if (!frame.current) {
      frame.current = requestAnimationFrame(render);
    }
  }

  function reset() {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = undefined;
    }

    target.current = { x: 0, y: 0 };
    start();
  }

  function move(event: PointerEvent<HTMLSpanElement>) {
    if (
      shouldReduceMotion ||
      event.pointerType === "touch" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const element = ref.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const stableLeft = rect.left - current.current.x;
    const stableTop = rect.top - current.current.y;
    const x = ((event.clientX - stableLeft) / rect.width - 0.5) * strength;
    const y = ((event.clientY - stableTop) / rect.height - 0.5) * strength;

    target.current = { x, y };
    start();
  }

  return (
    <span
      className={`magnetic-wrap ${className}`}
      onBlur={reset}
      onPointerLeave={reset}
      onPointerMove={move}
      ref={ref}
    >
      {children}
    </span>
  );
}
