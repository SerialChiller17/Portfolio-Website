import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  CSSProperties,
  MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { WordsPullUpMultiStyle } from "../components/AnimatedText";
import { ChapterRule } from "../components/ChapterRule";
import { Icon } from "../components/Icon";
import feeds from "../generated/feeds.json";
import {
  channels,
  descentBands,
  siteCopy,
  type LandscapeChannel,
  type ShortItem,
  type ShortsChannel
} from "../data";

const cardEase = [0.22, 1, 0.36, 1] as const;
const WORK_VIDEO_PLAY_EVENT = "jay-work-video-play";
const workBand = descentBands.find((band) => band.id === "work");

type GeneratedShort = {
  videoId: string;
  title: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
};

function mediaPrefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function announceVideoPlay(id: string) {
  window.dispatchEvent(new CustomEvent(WORK_VIDEO_PLAY_EVENT, { detail: id }));
}

function isFeatureProminent() {
  const feature = document.querySelector(".channel-feature");

  if (!feature) {
    return false;
  }

  const rect = feature.getBoundingClientRect();

  return rect.bottom > window.innerHeight * 0.18 && rect.top < window.innerHeight * 0.72;
}

function useSingleWorkVideo(videoRef: RefObject<HTMLVideoElement>, id: string) {
  useEffect(() => {
    function handlePlayRequest(event: Event) {
      const nextId = (event as CustomEvent<string>).detail;

      if (nextId !== id) {
        videoRef.current?.pause();
      }
    }

    window.addEventListener(WORK_VIDEO_PLAY_EVENT, handlePlayRequest);

    return () => {
      window.removeEventListener(WORK_VIDEO_PLAY_EVENT, handlePlayRequest);
    };
  }, [id, videoRef]);
}

function getResolvedShorts(channel: ShortsChannel) {
  const generated = feeds as {
    shorts?: Record<string, GeneratedShort[] | undefined>;
  };
  const generatedById = new Map(
    (generated.shorts?.[channel.id] ?? []).map((short) => [short.videoId, short])
  );

  return channel.shorts.slice(0, 8).map((short) => {
    const generatedShort = generatedById.get(short.id);

    return {
      ...short,
      title: generatedShort?.title || short.title,
      url: generatedShort?.url || short.url,
      publishedAt: generatedShort?.publishedAt || short.publishedAt
    };
  });
}

function FeatureChannel({
  channel,
  shouldPauseMotion
}: {
  channel: LandscapeChannel;
  shouldPauseMotion: boolean;
}) {
  const frameRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(frameRef, { once: true, margin: "-120px" });
  const shouldReduceMotion = useReducedMotion();
  const [isMuted, setIsMuted] = useState(true);
  const videoId = `${channel.id}-feature`;

  useSingleWorkVideo(videoRef, videoId);

  const playVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video || shouldPauseMotion) {
      video?.pause();
      return;
    }

    announceVideoPlay(videoId);
    void video.play().catch(() => {});
  }, [shouldPauseMotion, videoId]);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;

    if (!frame || !video) {
      return;
    }

    if (shouldPauseMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playVideo();
          return;
        }

        video.pause();
      },
      { threshold: 0.28 }
    );

    observer.observe(frame);

    return () => observer.disconnect();
  }, [playVideo, shouldPauseMotion]);

  function handleMuteToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsMuted((current) => {
      const nextMuted = !current;

      if (videoRef.current) {
        videoRef.current.muted = nextMuted;
      }

      return nextMuted;
    });
  }

  return (
    <motion.article
      className="channel-feature"
      ref={frameRef}
      style={
        {
          "--channel-accent": channel.accent
        } as CSSProperties
      }
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={inView || shouldReduceMotion ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: cardEase }}
    >
      <video
        aria-label={`${channel.name} trailer preview`}
        autoPlay={!shouldPauseMotion}
        className="channel-feature-video"
        loop
        muted={isMuted}
        playsInline
        poster={channel.posterSrc}
        preload="metadata"
        ref={videoRef}
        src={channel.previewSrc}
      />
      <div className="channel-edge-vignette" />
      <div className="channel-feature-scrim" />
      <div className="channel-grain" />

      <a
        aria-label={`Open ${channel.name} trailer with sound`}
        className="channel-feature-open focus-ring"
        href={channel.trailerUrl}
        rel="noreferrer"
        target="_blank"
      />

      <div className="channel-feature-copy">
        <p className="channel-kicker">For {channel.genre}</p>
        <h3 className="channel-feature-title">{channel.name}</h3>
        <a
          aria-label={`Watch ${channel.name}`}
          className="channel-watch-link focus-ring"
          href={channel.url}
          rel="noreferrer"
          target="_blank"
        >
          Watch
          <Icon className="h-4 w-4" icon="arrow" />
        </a>
      </div>

      <button
        aria-label={isMuted ? `Unmute ${channel.name} trailer` : `Mute ${channel.name} trailer`}
        className="channel-mute-button focus-ring"
        onClick={handleMuteToggle}
        type="button"
      >
        <Icon className="h-4 w-4" icon={isMuted ? "muted" : "volume"} />
      </button>
    </motion.article>
  );
}

function ShortTile({
  index,
  item,
  shouldPauseMotion
}: {
  index: number;
  item: ShortItem;
  shouldPauseMotion: boolean;
}) {
  const tileRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHovering = useRef(false);
  const isInView = useRef(false);
  const videoId = `nomaaya-short-${item.id}`;

  useSingleWorkVideo(videoRef, videoId);

  const playVideo = useCallback((force = false) => {
    const video = videoRef.current;

    if (!video || shouldPauseMotion) {
      video?.pause();
      return;
    }

    if (!force && isFeatureProminent()) {
      video.pause();
      return;
    }

    announceVideoPlay(videoId);
    void video.play().catch(() => {});
  }, [shouldPauseMotion, videoId]);

  useEffect(() => {
    const tile = tileRef.current;
    const video = videoRef.current;

    if (!tile || !video) {
      return;
    }

    if (shouldPauseMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          playVideo(false);
          return;
        }

        video.pause();
      },
      { threshold: 0.68 }
    );

    observer.observe(tile);

    return () => observer.disconnect();
  }, [playVideo, shouldPauseMotion]);

  function handlePointerEnter() {
    isHovering.current = true;
    playVideo(true);
  }

  function handlePointerLeave() {
    isHovering.current = false;

    if (!isInView.current) {
      videoRef.current?.pause();
    }
  }

  return (
    <a
      aria-label={`Open noMaaya Short: ${item.title}`}
      className="short-tile focus-ring"
      href={item.url}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      ref={tileRef}
      rel="noreferrer"
      style={
        {
          "--short-delay": `${index * 80}ms`
        } as CSSProperties
      }
      target="_blank"
    >
      <video
        aria-label={`noMaaya Short preview: ${item.title}`}
        autoPlay={!shouldPauseMotion}
        className="short-video"
        loop
        muted
        playsInline
        poster={item.posterSrc}
        preload="metadata"
        ref={videoRef}
        src={item.previewSrc}
      />
      <div className="short-tile-scrim" />
      <div className="channel-grain" />
    </a>
  );
}

function ShortsChannelBlock({
  channel,
  shouldPauseMotion
}: {
  channel: ShortsChannel;
  shouldPauseMotion: boolean;
}) {
  const shorts = useMemo(() => getResolvedShorts(channel), [channel]);

  return (
    <div
      className="shorts-channel"
      style={
        {
          "--channel-accent": channel.accent
        } as CSSProperties
      }
    >
      <div className="shorts-channel-shell">
        <div className="shorts-rail" role="list">
          {shorts.map((short, index) => (
            <ShortTile
              index={index}
              item={short}
              key={short.id}
              shouldPauseMotion={shouldPauseMotion}
            />
          ))}
        </div>

        <div className="shorts-channel-header">
          <p className="channel-kicker shorts-channel-kicker">For {channel.genre}</p>
          <h3 className="shorts-channel-title">{channel.name}</h3>
          <p className="shorts-channel-copy">Short cuts into sharper questions.</p>
          <a
            aria-label={`Watch ${channel.name}`}
            className="shorts-channel-watch focus-ring"
            href={channel.url}
            rel="noreferrer"
            target="_blank"
          >
            Watch
            <Icon className="h-4 w-4" icon="arrow" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function Channels() {
  const headingLabel = siteCopy.channelsHeading
    .map((segment) => segment.text)
    .join(" ");
  const landscape = channels.find(
    (channel): channel is LandscapeChannel => channel.type === "landscape"
  );
  const shorts = channels.find(
    (channel): channel is ShortsChannel => channel.type === "shorts"
  );
  const shouldReduceMotion = useReducedMotion();
  const shouldPauseMotion = Boolean(shouldReduceMotion || mediaPrefersReducedMotion());

  if (!landscape || !shorts) {
    return null;
  }

  return (
    <section
      aria-label="Work"
      className="section-pad work-section relative min-h-screen overflow-hidden bg-black"
      id="work"
    >
      <div className="field-grid" />
      <div className="bg-noise opacity-[0.12]" />
      <div className="relative mx-auto max-w-7xl">
        {workBand ? (
          <ChapterRule
            chapter={workBand.chapter}
            feet={workBand.feet}
            fl={workBand.fl}
            title="Broadcast"
          />
        ) : null}
        <h2
          aria-label={headingLabel}
          className="channels-heading max-w-4xl"
          id="channels-title"
        >
          <WordsPullUpMultiStyle
            className="justify-start"
            segments={siteCopy.channelsHeading}
          />
        </h2>

        <div className="work-channel-stack">
          <FeatureChannel
            channel={landscape}
            shouldPauseMotion={shouldPauseMotion}
          />
          <ShortsChannelBlock
            channel={shorts}
            shouldPauseMotion={shouldPauseMotion}
          />
        </div>
      </div>
    </section>
  );
}
