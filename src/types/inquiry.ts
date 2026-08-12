export type InquiryStatus = "Nueva" | "Contactada" | "Cerrada";

export interface InquiryFormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}
