import {
  motion,
  MotionValue,
  useInView,
  useReducedMotion,
  useTransform
} from "framer-motion";
import { CSSProperties, Fragment, ReactNode, useMemo, useRef } from "react";

type Segment = {
  text: string;
  className?: string;
};

type WordsPullUpProps = {
  text: string;
  showAsterisk?: boolean;
  className?: string;
  signature?: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

export function WordsPullUp({
  text,
  showAsterisk = false,
  className = "",
  signature = false
}: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`inline-flex flex-wrap items-baseline ${className}`}
    >
      {words.map((word, index) => {
        const isLast = index === words.length - 1;
        const midPoint = (word.length - 1) / 2;

        return (
          <span className="word-mask" key={`${word}-${index}`}>
            <motion.span
              className={`relative inline-block ${
                signature ? "signature-word" : ""
              }`}
              initial={shouldReduceMotion ? false : { y: 22, opacity: 0 }}
              animate={inView || shouldReduceMotion ? { y: 0, opacity: 1 } : {}}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.08,
                duration: 0.72,
                ease
              }}
            >
              {signature
                ? word.split("").map((letter, letterIndex) => {
                    const depth =
                      0.72 + Math.abs(letterIndex - midPoint) * 0.08;

                    return (
                      <span
                        className="signature-letter"
                        key={`${letter}-${letterIndex}`}
                        style={
                          {
                            "--letter-depth": depth.toFixed(2)
                          } as CSSProperties
                        }
                      >
                        {letter}
                      </span>
                    );
                  })
                : word}
              {showAsterisk && isLast ? (
                <sup className="absolute -right-[0.3em] top-[0.65em] text-[0.31em] leading-none">
                  *
                </sup>
              ) : null}
            </motion.span>
            {index < words.length - 1 ? <span>&nbsp;</span> : null}
          </span>
        );
      })}
    </span>
  );
}

type WordsPullUpMultiStyleProps = {
  segments: Segment[];
  className?: string;
  stackSegments?: boolean;
};

export function WordsPullUpMultiStyle({
  segments,
  className = "",
  stackSegments = false
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const shouldReduceMotion = useReducedMotion();
  const words = useMemo(
    () =>
      segments.flatMap((segment) =>
        segment.text.split(" ").map((word) => ({
          word,
          className: segment.className ?? ""
        }))
      ),
    [segments]
  );

  if (stackSegments) {
    let wordIndex = 0;

    return (
      <span ref={ref} aria-hidden="true" className="block w-full">
        {segments.map((segment) => (
          <span
            className={`flex w-full flex-wrap ${className}`}
            key={segment.text}
          >
            {segment.text.split(" ").map((word, localIndex, lineWords) => {
              const index = wordIndex;
              wordIndex += 1;

              return (
                <span
                  className={`word-mask ${segment.className ?? ""}`}
                  key={`${word}-${index}`}
                >
                  <motion.span
                    className="inline-block"
                    initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                    animate={
                      inView || shouldReduceMotion ? { y: 0, opacity: 1 } : {}
                    }
                    transition={{
                      delay: shouldReduceMotion ? 0 : index * 0.08,
                      duration: 0.7,
                      ease
                    }}
                  >
                    {word}
                  </motion.span>
                  {localIndex < lineWords.length - 1 ? <span>&nbsp;</span> : null}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    );
  }

  const alignmentClass = /\bjustify-/.test(className) ? "" : "justify-center";

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`flex w-full flex-wrap ${alignmentClass} ${className}`}
    >
      {words.map(({ word, className: wordClassName }, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className={`word-mask ${wordClassName}`}>
            <motion.span
              className="inline-block"
              initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
              animate={inView || shouldReduceMotion ? { y: 0, opacity: 1 } : {}}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.08,
                duration: 0.7,
                ease
              }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? <span>&nbsp;</span> : null}
        </Fragment>
      ))}
    </span>
  );
}

type AnimatedLetterProps = {
  children: ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
};

export function AnimatedLetter({
  children,
  index,
  total,
  progress
}: AnimatedLetterProps) {
  const charProgress = total <= 1 ? 1 : index / total;
  const opacity = useTransform(
    progress,
    [Math.max(0, charProgress - 0.1), Math.min(1, charProgress + 0.05)],
    [0.2, 1]
  );

  return <motion.span style={{ opacity }}>{children}</motion.span>;
}
