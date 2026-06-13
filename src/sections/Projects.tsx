import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { WordsPullUpMultiStyle } from "../components/AnimatedText";
import { Icon } from "../components/Icon";
import { projects, siteCopy, type Project } from "../data";
import { LifeInWeeksProject } from "./LifeInWeeksProject";
import { MarketRiderProject } from "./MarketRiderProject";

const cardEase = [0.22, 1, 0.36, 1] as const;

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const tags = project.tags ?? [];
  const projectNumber = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      className={`project-card group ${
        project.isPlaceholder ? "project-card-placeholder" : ""
      }`}
      id={project.slug}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      transition={{
        duration: 0.28,
        ease: cardEase
      }}
    >
      <div className="project-card-top">
        <span className="project-meta">{projectNumber}</span>
        <span aria-hidden="true" className="project-status" />
      </div>

      <div className="project-card-copy">
        {project.icon ? (
          <div className="project-icon">
            <Icon className="h-6 w-6 text-black" icon={project.icon} />
          </div>
        ) : null}
        <h3>{project.title}</h3>
        {project.description ? <p>{project.description}</p> : null}
        {project.proof ? <p className="project-proof">{project.proof}</p> : null}
      </div>

      {tags.length > 0 ? (
        <div className="project-tags">
          {tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {project.route ? (
        <div className="project-action">
          <Link
            aria-label={`Open ${project.title}`}
            className="interaction-link inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-cream focus-ring"
            to={project.route}
          >
            {siteCopy.ui.viewAction}
            <Icon className="link-arrow h-4 w-4 -rotate-45" icon="arrow" />
          </Link>
        </div>
      ) : project.href ? (
        <div className="project-action">
          <a
            className="interaction-link inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-cream focus-ring"
            href={project.href}
            rel="noreferrer"
            target="_blank"
          >
            {siteCopy.ui.viewAction}
            <Icon className="link-arrow h-4 w-4 -rotate-45" icon="arrow" />
          </a>
        </div>
      ) : null}
    </motion.article>
  );
}

export function Projects() {
  const projectsHeadingLabel = siteCopy.projectsHeading
    .map((segment) => segment.text)
    .join(" ");

  return (
    <section
      aria-label="Projects"
      className="projects-page section-pad bg-black"
      id="projects"
    >
      <div className="projects-shell mx-auto max-w-7xl">
        <header className="projects-hero">
          <div className="projects-manifest">
            <p className="projects-kicker">The Lab</p>
            <h1
              aria-label={projectsHeadingLabel}
              className="projects-title"
              id="projects-title"
            >
              <WordsPullUpMultiStyle
                className="justify-start"
                segments={siteCopy.projectsHeading}
              />
            </h1>
            <p className="projects-lede">
              A small index of experiments, tools, and odd ideas that earned a
              page of their own.
            </p>
          </div>

          <nav aria-label="Lab directory" className="projects-directory">
            <div className="projects-directory-head">
              <span>Directory</span>
            </div>
            {projects.map((project, index) => (
              <Link
                className="projects-directory-link focus-ring"
                key={project.slug}
                to={project.route ?? `/projects/${project.slug}`}
              >
                <span>
                  <span>{project.title}</span>
                  <small>{project.description}</small>
                </span>
                <span className="projects-directory-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="projects-directory-arrow" icon="arrow" />
              </Link>
            ))}
          </nav>
        </header>
      </div>
    </section>
  );
}

export function ProjectDetail({ slug }: { slug: string }) {
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return <Projects />;
  }

  return (
    <section
      aria-label={project.title}
      className="projects-page project-detail-page section-pad bg-black"
      id="projects"
    >
      <div className="mx-auto max-w-7xl">
        <h1 className="sr-only">{project.title}</h1>
        <Link className="project-back-link focus-ring" to="/projects">
          Lab
          <Icon className="h-4 w-4 rotate-180" icon="arrow" />
        </Link>

        <div className="projects-list grid grid-cols-1 gap-3 md:grid-cols-2">
          {project.kind === "life-weeks" ? (
            <LifeInWeeksProject project={project} />
          ) : project.kind === "market-rider" ? (
            <MarketRiderProject project={project} />
          ) : (
            <ProjectCard index={0} project={project} />
          )}
        </div>
      </div>
    </section>
  );
}
