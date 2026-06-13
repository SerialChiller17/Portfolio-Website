import { useEffect, useMemo, useState } from "react";
import { ChapterRule } from "../components/ChapterRule";
import { Icon } from "../components/Icon";
import loopFeed from "../generated/the-loop.json";
import { descentBands, loopCopy, siteCopy } from "../data";

const loopBand = descentBands.find((band) => band.id === "now");

type LoopVideo = {
  id: string;
  watchUrl: string;
  thumbnail: string;
  title?: string;
  channel?: string;
};

function PlayGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 5l11 7-11 7z" />
    </svg>
  );
}

function FilmFrame({ video }: { video: LoopVideo }) {
  const title = video.title || "Open on YouTube";
  const channel = video.channel || "YouTube";
  const caption = `${title} · ${channel}`;

  return (
    <a
      aria-label={`Open YouTube video: ${caption}`}
      className="loop-frame focus-ring"
      href={video.watchUrl}
      rel="noopener noreferrer"
      target="_blank"
      title={caption}
    >
      <div className="loop-perf" />
      <div className="loop-window">
        <img
          alt={`YouTube thumbnail: ${title}`}
          loading="lazy"
          src={video.thumbnail}
        />
        <span className="loop-play-badge">
          <PlayGlyph />
        </span>
      </div>
      <div className="loop-perf" />
    </a>
  );
}

export function TheLoop() {
  const videos = loopFeed.videos as LoopVideo[];
  const filmFrames = useMemo(() => [...videos, ...videos], [videos]);
  const [caption, setCaption] = useState("hover a frame to preview");
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const bookCount = loopCopy.read.books.length;
  const activeBook = loopCopy.read.books[activeBookIndex];

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const rotation = window.setInterval(() => {
      setActiveBookIndex((current) => (current + 1) % bookCount);
    }, 5200);

    return () => window.clearInterval(rotation);
  }, [bookCount]);

  function updateCaption(video: LoopVideo) {
    const title = video.title || "Open on YouTube";
    const channel = video.channel || "YouTube";

    setCaption(`${title} · ${channel}`);
  }

  function showBook(direction: -1 | 1) {
    setActiveBookIndex((current) => (current + direction + bookCount) % bookCount);
  }

  return (
    <section aria-label="The Loop" className="loop-section" id="now">
      <div className="loop-wrap">
        {loopBand ? (
          <ChapterRule
            chapter={loopBand.chapter}
            feet={loopBand.feet}
            fl={loopBand.fl}
            title="Inputs"
          />
        ) : null}
        <h2 className="loop-now">
          You can tell a lot about a man by what he watches, what he listens to,
          and what he reads. <em>Here is mine.</em>
        </h2>

        <section className="loop-film-block" aria-label="Watch">
          <div className="loop-film-head">
            <div className="loop-film-label">
              <b>On the reel.</b>
              Watch · not mine, just good
            </div>
            {loopCopy.fullListHref ? (
              <a
                className="loop-film-cta focus-ring"
                href={loopCopy.fullListHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                the full list <span aria-hidden="true">-&gt;</span>
              </a>
            ) : null}
          </div>

          <div className="loop-filmstrip">
            <div className="loop-film">
              {filmFrames.map((video, index) => (
                <span
                  className="loop-frame-wrap"
                  key={`${video.id}-${index}`}
                  onFocus={() => updateCaption(video)}
                  onMouseEnter={() => updateCaption(video)}
                >
                  <FilmFrame video={video} />
                </span>
              ))}
            </div>
          </div>

          <div className="loop-caption">
            <span aria-hidden="true">▶</span>{" "}
            <b>{caption.split(" · ")[0]}</b>
            {caption.includes(" · ") ? (
              <>
                {" "}
                · {caption.split(" · ").slice(1).join(" · ")}
              </>
            ) : null}
          </div>
        </section>

        <div className="loop-media-grid">
          <article className="loop-card loop-listen">
            <div className="loop-card-label">
              <span>Listen</span>
              <span className="loop-eq" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <h3 className="loop-card-title">On rotation.</h3>
            <div className="loop-listen-inner">
              <div className="loop-platter">
                <div className="loop-record">
                  <div className="loop-label">
                    <div>
                      <b>~J~</b>
                      <small>side a</small>
                    </div>
                  </div>
                </div>
                <div className="loop-spindle" />
                <div className="loop-tonearm">
                  <span className="loop-pivot" />
                  <span className="loop-arm" />
                  <span className="loop-head" />
                </div>
              </div>

              <ul className="loop-tracks">
                {loopCopy.spotifyTracks.map((track, index) => (
                  <li key={`${track.title}-${track.artist}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <b>{track.title}</b> · {track.artist}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <a
              className="loop-cta focus-ring"
              href={siteCopy.spotify.playlistUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              open in spotify <span aria-hidden="true">-&gt;</span>
            </a>
          </article>

          <article className="loop-card loop-read">
            <div className="loop-card-label">
              <span>Read</span>
              <b>{loopCopy.read.label}</b>
            </div>
            <h3 className="loop-card-title">{loopCopy.read.title}</h3>
            <p className="loop-read-note">{loopCopy.read.note}</p>
            <div className="loop-book-shelf" aria-label="Books on rotation">
              <article className="loop-book-feature" aria-live="polite">
                <div className="loop-book-cover-stage">
                  <div className="loop-book-cover-frame">
                    <img
                      alt={`Book cover: ${activeBook.title}`}
                      className="loop-book-cover"
                      key={activeBook.coverSrc}
                      loading="lazy"
                      src={activeBook.coverSrc}
                    />
                  </div>
                </div>

                <div className="loop-book-feature-copy">
                  <span>Current shelf mark</span>
                  <h4>{activeBook.title}</h4>
                  <p>{activeBook.author}</p>
                </div>
              </article>

              <div className="loop-book-controls" aria-label="Book controls">
                <button
                  aria-label="Previous book"
                  className="loop-book-control focus-ring"
                  onClick={() => showBook(-1)}
                  type="button"
                >
                  <Icon className="h-4 w-4 rotate-180" icon="arrow" />
                </button>
                <div className="loop-book-dots">
                  {loopCopy.read.books.map((book, index) => (
                    <button
                      aria-label={`Show ${book.title}`}
                      aria-pressed={activeBookIndex === index}
                      className={activeBookIndex === index ? "is-active" : ""}
                      key={book.title}
                      onClick={() => setActiveBookIndex(index)}
                      type="button"
                    />
                  ))}
                </div>
                <button
                  aria-label="Next book"
                  className="loop-book-control focus-ring"
                  onClick={() => showBook(1)}
                  type="button"
                >
                  <Icon className="h-4 w-4" icon="arrow" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
