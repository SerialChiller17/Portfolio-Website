export function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4);
}

export const SCROLL_TARGET_OFFSET = 18;

export function smoothScrollToHash(hash: string, reduceMotion: boolean) {
  const target = document.querySelector<HTMLElement>(hash);

  if (!target) {
    return;
  }

  if (reduceMotion) {
    target.scrollIntoView();
    window.history.replaceState(null, "", `/${hash}`);
    return;
  }

  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + start - SCROLL_TARGET_OFFSET;
  const distance = end - start;
  const duration = 720;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo({
      behavior: "instant",
      top: start + distance * easeOutQuart(progress)
    });

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    window.history.replaceState(null, "", `/${hash}`);
  }

  requestAnimationFrame(step);
}
