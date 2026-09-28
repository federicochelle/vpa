export type InquiryKind = "property" | "project" | "project_unit" | "general";
export type InquiryIntent =
  | "general"
  | "advisory"
  | "contact"
  | "sell"
  | "valuation"
  | "investment"
  | "professional_report";
export type InquiryStatus = "new" | "contacted" | "closed";
export type InquiryMeetingStatus = "scheduled" | "cancelled";

export interface InquiryFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface Inquiry {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  intent: InquiryIntent | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
  landingPage: string | null;
  googleEventId: string | null;
  meetUrl: string | null;
  meetingStart: string | null;
  meetingEnd: string | null;
  meetingStatus: InquiryMeetingStatus | null;
  propertyId: string | null;
  projectId: string | null;
  projectUnitId: string | null;
  relatedTitle: string | null;
  originPath: string | null;
  status: InquiryStatus;
  createdAt: string;
}

export interface PublicInquiryPayload {
  kind: "property" | "project" | "general";
  intent?: InquiryIntent | null;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  propertyId?: string;
  projectId?: string;
  relatedTitle?: string | null;
  originPath: string;
}
