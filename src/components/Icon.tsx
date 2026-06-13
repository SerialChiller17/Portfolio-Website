import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartCandlestick,
  Clapperboard,
  House,
  Mail,
  Menu,
  PlayCircle,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { SVGProps } from "react";
import type { IconKey } from "../data";

type IconProps = {
  icon: IconKey;
  className?: string;
  strokeWidth?: number;
};

function LinkedinIcon({ className = "" }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <rect
        height="17"
        rx="3.1"
        stroke="currentColor"
        strokeWidth="1.8"
        width="17"
        x="3.5"
        y="3.5"
      />
      <circle cx="8.15" cy="8.1" fill="currentColor" r="1.35" />
      <path
        d="M7.02 11.05h2.25v6.05H7.02v-6.05ZM11.1 11.05h2.16v.78c.43-.58 1.1-.98 2.07-.98 1.5 0 2.65.98 2.65 3.08v3.17h-2.25v-2.86c0-.93-.4-1.43-1.14-1.43-.77 0-1.24.5-1.24 1.43v2.86H11.1v-6.05Z"
        fill="currentColor"
      />
    </svg>
  );
}

const icons = {
  arrow: ArrowRight,
  youtube: PlayCircle,
  linkedin: LinkedinIcon,
  substack: BookOpen,
  mail: Mail,
  home: House,
  shorts: Clapperboard,
  chart: ChartCandlestick,
  brain: BrainCircuit,
  sparkles: Sparkles,
  menu: Menu,
  close: X,
  volume: Volume2,
  muted: VolumeX
};

export function Icon({ icon, className = "", strokeWidth = 1.75 }: IconProps) {
  const Component = icons[icon];
  return (
    <Component aria-hidden="true" className={className} strokeWidth={strokeWidth} />
  );
}
