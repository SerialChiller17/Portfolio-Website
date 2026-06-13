import { useReducedMotion } from "framer-motion";
import { Check, Copy, Mail, Send } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { WordsPullUpMultiStyle } from "../components/AnimatedText";
import { ChapterRule } from "../components/ChapterRule";
import { Icon } from "../components/Icon";
import { Magnetic } from "../components/Magnetic";
import { SmartLink } from "../components/SmartLink";
import { connectLinks, descentBands, siteCopy } from "../data";

const groundBand = descentBands.find((band) => band.id === "connect");
const TYPE_PROMPT_MS = 45;
const DELETE_PROMPT_MS = 24;
const HOLD_PROMPT_MS = 1500;
const REST_PROMPT_MS = 360;

type PromptPhase = "typing" | "deleting";

export function Connect() {
  const shouldReduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messagePromptIndex, setMessagePromptIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [promptPhase, setPromptPhase] = useState<PromptPhase>("typing");
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [phase, setPhase] = useState<"writing" | "folding" | "sent">("writing");
  const messagePrompts = siteCopy.messagePrompts;
  const currentPrompt =
    messagePrompts[messagePromptIndex] ?? messagePrompts[0] ?? "say what you came to say";
  const hasMessage = message.trim().length > 0;
  const visibleLinks = connectLinks.filter(
    (link) => Boolean(link.href) && link.label !== "Email"
  );
  const headingLabel = siteCopy.connectHeading
    .map((segment) => segment.text)
    .join(" ");
  const contactEmail = siteCopy.email;
  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(
      name.trim() ? `Website note from ${name.trim()}` : "Website note"
    );
    const body = encodeURIComponent(
      [
        name.trim() ? `From: ${name.trim()}` : "",
        replyEmail.trim() ? `Reply to: ${replyEmail.trim()}` : "",
        "",
        message.trim()
      ]
        .filter(Boolean)
        .join("\n")
    );

    return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  }, [contactEmail, message, name, replyEmail]);

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timeout = window.setTimeout(() => setIsCopied(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  useEffect(() => {
    if (!shouldReduceMotion || hasMessage) {
      return;
    }

    setTypedPrompt(currentPrompt);
  }, [currentPrompt, hasMessage, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion || hasMessage || messagePrompts.length === 0) {
      return;
    }

    if (promptPhase === "typing") {
      if (typedPrompt.length < currentPrompt.length) {
        const timeout = window.setTimeout(() => {
          setTypedPrompt(currentPrompt.slice(0, typedPrompt.length + 1));
        }, TYPE_PROMPT_MS);

        return () => window.clearTimeout(timeout);
      }

      const timeout = window.setTimeout(() => {
        setPromptPhase("deleting");
      }, HOLD_PROMPT_MS);

      return () => window.clearTimeout(timeout);
    }

    if (typedPrompt.length > 0) {
      const timeout = window.setTimeout(() => {
        setTypedPrompt(currentPrompt.slice(0, typedPrompt.length - 1));
      }, DELETE_PROMPT_MS);

      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setMessagePromptIndex((index) => (index + 1) % messagePrompts.length);
      setPromptPhase("typing");
    }, REST_PROMPT_MS);

    return () => window.clearTimeout(timeout);
  }, [
    currentPrompt,
    hasMessage,
    messagePrompts.length,
    promptPhase,
    shouldReduceMotion,
    typedPrompt
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (phase === "folding") {
      return;
    }

    setPhase("folding");
    window.setTimeout(() => {
      setPhase("sent");
      window.location.href = mailtoHref;
    }, 1050);
  }

  async function handleCopyEmail() {
    setIsEmailVisible(true);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(contactEmail);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <footer
      aria-labelledby="connect-title"
      className="connect-section section-pad relative overflow-hidden bg-black"
      id="connect"
    >
      <div className="bg-noise opacity-[0.12]" />
      <svg
        aria-hidden="true"
        className="connect-skytrail"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 700"
      >
        <path
          className="connect-flight-path"
          d="M -80 512 C 145 570, 128 256, 350 250 C 548 245, 635 142, 836 158 C 1036 174, 1048 76, 1192 42"
        />
        <path
          className="connect-flight-plane"
          d="M1097 48 L1174 78 L1086 92 L1112 72 Z"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        {groundBand ? (
          <ChapterRule
            chapter={groundBand.chapter}
            feet={groundBand.feet}
            fl={groundBand.fl}
            title="Ground"
          />
        ) : null}
        <h2
          aria-label={headingLabel}
          className="connect-title text-4xl font-normal leading-none text-cream sm:text-5xl md:text-6xl"
          id="connect-title"
        >
          <WordsPullUpMultiStyle
            className="justify-center"
            segments={siteCopy.connectHeading}
          />
        </h2>

        <p className="connect-copy mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-primary/75 sm:text-base">
          {siteCopy.contactLine}
        </p>

        <div className="connect-dispatch">
          <div className="connect-route-card">
            <p className="connect-route-kicker">Rather use your own inbox?</p>
            <button
              className="connect-reveal focus-ring"
              onClick={() => setIsEmailVisible(true)}
              type="button"
            >
              <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
              <span>Reveal address</span>
            </button>

            <div
              aria-live="polite"
              className={`connect-email-line ${isEmailVisible ? "is-visible" : ""}`}
            >
              {isEmailVisible ? (
                <>
                  <code>{contactEmail}</code>
                  <button
                    className={`connect-copy-button focus-ring ${
                      isCopied ? "is-copied" : ""
                    }`}
                    onClick={handleCopyEmail}
                    type="button"
                  >
                    {isCopied ? (
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    ) : (
                      <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                    )}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </button>
                </>
              ) : null}
            </div>

            <div className="connect-socials" aria-label="Elsewhere links">
              {visibleLinks.map((link) => (
                <Magnetic key={link.label} strength={7}>
                  <SmartLink
                    className="connect-button"
                    external={link.external ?? true}
                    href={link.href}
                    label={link.label}
                  >
                    <Icon className="h-4 w-4" icon={link.icon} />
                    <span>{link.label}</span>
                  </SmartLink>
                </Magnetic>
              ))}
            </div>
          </div>

          <div className={`connect-stage is-${phase}`}>
            <div className="connect-letter" aria-hidden={phase === "sent"}>
              <div className="connect-crease" />
              <div className="connect-stamp">
                <div className="connect-stamp-ring" />
                <div className="connect-stamp-frame">
                  <Send aria-hidden="true" className="h-4 w-4" strokeWidth={1.45} />
                  <span>Par avion</span>
                </div>
              </div>

              <div className="connect-letter-content">
                <div className="connect-letter-head">
                  Dispatch <span>·</span> <b>to Jay</b>
                </div>

                <form className="connect-form" onSubmit={handleSubmit}>
                  <div className="connect-form-row">
                    <label className="connect-field" htmlFor="contact-name">
                      <span>From</span>
                      <input
                        id="contact-name"
                        name="name"
                        onChange={(event) => setName(event.currentTarget.value)}
                        placeholder="your name"
                        required
                        type="text"
                        value={name}
                      />
                    </label>

                    <label className="connect-field" htmlFor="contact-email">
                      <span>Reply to</span>
                      <input
                        id="contact-email"
                        name="email"
                        onChange={(event) => setReplyEmail(event.currentTarget.value)}
                        placeholder="your email"
                        required
                        type="email"
                        value={replyEmail}
                      />
                    </label>
                  </div>

                  <label
                    className="connect-field connect-message-field"
                    htmlFor="contact-message"
                  >
                    <span>Message</span>
                    <div className="connect-message-shell">
                      {!hasMessage ? (
                        <span className="connect-typewriter" aria-hidden="true">
                          <span className="connect-typewriter-text">
                            {typedPrompt}
                          </span>
                          <span className="connect-typewriter-cursor" />
                        </span>
                      ) : null}
                      <textarea
                        id="contact-message"
                        name="message"
                        onChange={(event) => setMessage(event.currentTarget.value)}
                        placeholder=""
                        required
                        rows={3}
                        value={message}
                      />
                    </div>
                  </label>

                  <button
                    className="connect-send focus-ring"
                    disabled={phase === "folding"}
                    type="submit"
                  >
                    <span>{phase === "folding" ? "Folding" : "Fold & send"}</span>
                    <Send aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </form>
              </div>
            </div>

            <div aria-hidden="true" className="connect-launch">
              <svg className="connect-launch-trail" viewBox="0 0 380 360">
                <path d="M120 218 C 190 196, 246 122, 352 52" />
              </svg>
              <Send className="connect-launch-plane" strokeWidth={1.4} />
            </div>

            <div aria-live="polite" className="connect-confirm">
              <div className="connect-confirm-kicker">Ready</div>
              <h3>Opened in your inbox.</h3>
              <p>The note is folded into a real email, so you can send it your way.</p>
            </div>
          </div>
        </div>

        <p className="connect-footer-line text-xs text-gray-500">
          {siteCopy.footerLine}
        </p>
      </div>
    </footer>
  );
}
