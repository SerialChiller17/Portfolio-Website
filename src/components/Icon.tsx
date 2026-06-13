import {
  ArrowRight,
  BadgeCheck,
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
import type { IconKey } from "../data";

type IconProps = {
  icon: IconKey;
  className?: string;
  strokeWidth?: number;
};

const icons = {
  arrow: ArrowRight,
  youtube: PlayCircle,
  linkedin: BadgeCheck,
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
