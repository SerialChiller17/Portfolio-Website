import { ReactNode } from "react";

type SmartLinkProps = {
  href?: string;
  label: string;
  className: string;
  children: ReactNode;
  external?: boolean;
};

export function SmartLink({
  href,
  label,
  className,
  children,
  external = true
}: SmartLinkProps) {
  if (href) {
    return (
      <a
        aria-label={label}
        className={`${className} focus-ring`}
        href={href}
        rel={external ? "noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  }

  return null;
}
