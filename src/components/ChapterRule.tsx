type ChapterRuleProps = {
  chapter: string;
  title: string;
  fl: string;
  feet: number;
  tone?: "default" | "paper";
};

function formatFeet(feet: number) {
  return `${feet.toLocaleString("en-US")} FT`;
}

export function ChapterRule({
  chapter,
  title,
  fl,
  feet,
  tone = "default"
}: ChapterRuleProps) {
  return (
    <div
      aria-hidden="true"
      className={`chapter-rule ${tone === "paper" ? "chapter-rule-paper" : ""}`}
    >
      <span className="chapter-rule-side">
        <span className="chapter-rule-no">CH {chapter}</span>
        <span className="chapter-rule-dot">·</span>
        <span>{title}</span>
      </span>
      <span className="chapter-rule-line" />
      <span className="chapter-rule-side chapter-rule-alt">
        <span>{fl}</span>
        <span className="chapter-rule-dot">·</span>
        <span>{formatFeet(feet)}</span>
      </span>
    </div>
  );
}
