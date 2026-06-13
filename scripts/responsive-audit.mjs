import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.AUDIT_URL ?? "http://127.0.0.1:5173/";
const outputDir = path.resolve("qa-screenshots", "responsive-audit");
const pages = [
  { name: "home", path: "/", requireHeroFullBleed: true },
  { name: "about", path: "/about", requireHeroFullBleed: false },
  { name: "projects", path: "/projects", requireHeroFullBleed: false }
];
const viewports = [
  { name: "phone-320", width: 320, height: 720 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "laptop-1366", width: 1366, height: 768 },
  { name: "desktop-1920", width: 1920, height: 1080 }
];

function formatIssue(issue) {
  return `${issue.page}/${issue.viewport}: ${issue.message}`;
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const issues = [];
const reports = [];

try {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const sitePage of pages) {
    for (const viewport of viewports) {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      await page.goto(new URL(sitePage.path, baseUrl).toString(), {
        waitUntil: "networkidle"
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo(0, 0);
      });

      const report = await page.evaluate(() => {
        const viewportWidth = window.innerWidth;
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );
        const heroFrame = document.querySelector(".hero-frame")?.getBoundingClientRect();
        const pageSections = Array.from(document.querySelectorAll("section, footer"))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              className: element.className,
              id: element.id,
              left: rect.left,
              right: rect.right,
              width: rect.width
            };
          })
          .filter((section) => section.left < -1 || section.right > viewportWidth + 1);
        const protrudingElements = Array.from(document.querySelectorAll("body *"))
          .filter(
            (element) =>
              !element.closest(".shorts-rail") &&
              !element.closest(".loop-filmstrip") &&
              !element.closest(".connect-skytrail") &&
              !element.closest(".connect-crease") &&
              !element.closest(".game-contours") &&
              !element.closest("#connect svg")
          )
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return {
              className:
                typeof element.className === "string" ? element.className : "",
              id: element.id,
              tag: element.tagName.toLowerCase(),
              left: rect.left,
              right: rect.right,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              position: style.position
            };
          })
          .filter(
            (element) =>
              element.width > 1 &&
              element.height > 1 &&
              element.position !== "fixed" &&
              (element.left < -1 || element.right > viewportWidth + 1)
          )
          .slice(0, 12);
        const nestedVerticalScrollers = Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const style = window.getComputedStyle(element);

            return {
              className:
                typeof element.className === "string" ? element.className : "",
              id: element.id,
              tag: element.tagName.toLowerCase(),
              overflowY: style.overflowY,
              clientHeight: element.clientHeight,
              scrollHeight: element.scrollHeight
            };
          })
          .filter(
            (element) =>
              /^(auto|scroll|overlay)$/.test(element.overflowY) &&
              element.scrollHeight > element.clientHeight + 1
          )
          .slice(0, 12);
        const loopSection = document.querySelector(".loop-section");
        const loopGrainAnimation = loopSection
          ? window.getComputedStyle(loopSection, "::before").animationName
          : null;

        return {
          documentWidth,
          heroFrame: heroFrame
            ? {
                left: heroFrame.left,
                right: heroFrame.right,
                top: heroFrame.top,
                width: heroFrame.width
              }
            : null,
          pageSections,
          protrudingElements,
          nestedVerticalScrollers,
          loopGrainAnimation,
          viewportWidth
        };
      });

      reports.push({ page: sitePage, viewport, report });

      if (report.documentWidth > viewport.width + 1) {
        issues.push({
          page: sitePage.name,
          viewport: viewport.name,
          message: `document scrollWidth ${report.documentWidth}px exceeds viewport ${viewport.width}px`
        });
      }

      if (sitePage.requireHeroFullBleed) {
        if (!report.heroFrame) {
          issues.push({
            page: sitePage.name,
            viewport: viewport.name,
            message: "missing .hero-frame"
          });
        } else {
          const heroHasInset =
            Math.abs(report.heroFrame.left) > 1 ||
            Math.abs(report.heroFrame.top) > 1 ||
            Math.abs(report.heroFrame.right - viewport.width) > 1;

          if (heroHasInset) {
            issues.push({
              page: sitePage.name,
              viewport: viewport.name,
              message: `.hero-frame is inset (${Math.round(report.heroFrame.left)}px left, ${Math.round(report.heroFrame.top)}px top, ${Math.round(report.heroFrame.right)}px right edge) instead of full-bleed`
            });
          }
        }
      }

      for (const section of report.pageSections) {
        issues.push({
          page: sitePage.name,
          viewport: viewport.name,
          message: `section ${section.id || section.className || "unnamed"} spills horizontally (${Math.round(section.left)}px to ${Math.round(section.right)}px)`
        });
      }

      for (const element of report.protrudingElements) {
        issues.push({
          page: sitePage.name,
          viewport: viewport.name,
          message: `${element.tag}.${element.className || element.id || "unnamed"} protrudes (${Math.round(element.left)}px to ${Math.round(element.right)}px)`
        });
      }

      for (const element of report.nestedVerticalScrollers) {
        issues.push({
          page: sitePage.name,
          viewport: viewport.name,
          message: `${element.tag}.${element.className || element.id || "unnamed"} creates a nested vertical scrollbar (${element.clientHeight}px client, ${element.scrollHeight}px scroll)`
        });
      }

      if (report.loopGrainAnimation && report.loopGrainAnimation !== "none") {
        issues.push({
          page: sitePage.name,
          viewport: viewport.name,
          message: `.loop-section grain animation is active (${report.loopGrainAnimation})`
        });
      }

      await page.screenshot({
        fullPage: true,
        path: path.join(outputDir, `${sitePage.name}-${viewport.name}.png`)
      });

      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.waitForTimeout(700);

      const motionReport = await page.evaluate(() => {
        const loopSection = document.querySelector(".loop-section");

        if (!loopSection) {
          return null;
        }

        const style = window.getComputedStyle(loopSection);
        const beforeStyle = window.getComputedStyle(loopSection, "::before");

        return {
          overflowY: style.overflowY,
          clientHeight: loopSection.clientHeight,
          scrollHeight: loopSection.scrollHeight,
          grainAnimation: beforeStyle.animationName
        };
      });

      if (motionReport) {
        if (
          /^(auto|scroll|overlay)$/.test(motionReport.overflowY) &&
          motionReport.scrollHeight > motionReport.clientHeight + 1
        ) {
          issues.push({
            page: sitePage.name,
            viewport: viewport.name,
            message: `.loop-section creates a nested vertical scrollbar in normal motion (${motionReport.clientHeight}px client, ${motionReport.scrollHeight}px scroll)`
          });
        }

        if (motionReport.grainAnimation !== "none") {
          issues.push({
            page: sitePage.name,
            viewport: viewport.name,
            message: `.loop-section grain animation is active in normal motion (${motionReport.grainAnimation})`
          });
        }
      }
    }
  }
} finally {
  await browser.close();
}

await writeFile(
  path.join(outputDir, "report.json"),
  `${JSON.stringify(reports, null, 2)}\n`
);

if (issues.length > 0) {
  console.error(["Responsive audit failed:", ...issues.map(formatIssue)].join("\n"));
  process.exit(1);
}

console.log(
  `Responsive audit passed across ${pages.length} routes and ${viewports.length} viewports. Screenshots: ${outputDir}`
);
