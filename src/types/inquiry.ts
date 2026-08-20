export type InquiryKind = "property" | "project" | "project_unit" | "general";
export type InquiryStatus = "new" | "contacted" | "closed";

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
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  projectId?: string;
  relatedTitle: string;
  originPath: string;
}
