interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "mobile-center";
  titleAs?: "h1" | "h2";
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleAs = "h2",
  titleClassName = "text-foreground",
  descriptionClassName = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "items-center text-center"
      : align === "mobile-center"
        ? "items-center text-center sm:items-start sm:text-left"
        : "items-start";
  const TitleTag = titleAs;

  return (
    <div className={`flex w-full max-w-3xl min-w-0 flex-col gap-3 ${alignment}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <TitleTag className={`section-title w-full max-w-full min-w-0 ${titleClassName}`}>
        {title}
      </TitleTag>
      {description ? (
        <p className={`section-copy ${descriptionClassName}`}>{description}</p>
      ) : null}
    </div>
  );
}
