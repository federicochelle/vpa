interface NoticeProps {
  tone: "success" | "error";
  message: string;
}

export function Notice({ tone, message }: NoticeProps) {
  const classes =
    tone === "success"
      ? "border-primary/20 bg-primary/6 text-primary-strong"
      : "border-primary/25 bg-primary/8 text-primary-strong";

  return <div className={`panel border px-5 py-4 type-body-compact ${classes}`}>{message}</div>;
}
