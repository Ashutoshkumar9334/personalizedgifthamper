import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-16 ${className}`}>{children}</section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-16 text-muted-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
      {children}
    </div>
  );
}
