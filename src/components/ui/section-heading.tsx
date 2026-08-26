interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleAs?: "h1" | "h2";
  titleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleAs = "h2",
  titleClassName = "text-foreground",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start";
  const TitleTag = titleAs;

  return (
    <div className={`flex max-w-3xl flex-col gap-3 ${alignment}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <TitleTag className={`section-title ${titleClassName}`}>{title}</TitleTag>
      {description ? <p className="section-copy">{description}</p> : null}
    </div>
  );
}
