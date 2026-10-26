export const INQUIRY_HONEYPOT_FIELD_NAME = "website";

export function InquiryHoneypotField() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 0,
        left: "-10000px",
        overflow: "hidden",
        position: "absolute",
        top: "auto",
        width: 0,
      }}
    >
      <label htmlFor={`inquiry-${INQUIRY_HONEYPOT_FIELD_NAME}`}>Website</label>
      <input
        autoComplete="off"
        id={`inquiry-${INQUIRY_HONEYPOT_FIELD_NAME}`}
        name={INQUIRY_HONEYPOT_FIELD_NAME}
        tabIndex={-1}
        type="text"
      />
    </div>
  );
}
