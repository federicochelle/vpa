import type { InquiryStatus } from "@/types/inquiry";

export const INQUIRY_STATUS_OPTIONS: Array<{
  label: string;
  value: InquiryStatus;
}> = [
  { label: "Nueva", value: "new" },
  { label: "Contactada", value: "contacted" },
  { label: "Cerrada", value: "closed" },
];

export function isInquiryStatus(value: string): value is InquiryStatus {
  return value === "new" || value === "contacted" || value === "closed";
}
