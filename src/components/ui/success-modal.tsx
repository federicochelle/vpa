"use client";

import { AdminFeedbackModal } from "@/components/admin/admin-feedback-modal";

interface SuccessModalProps {
  title?: string;
  message: string;
}

export function SuccessModal({
  title = "Propiedad creada",
  message,
}: SuccessModalProps) {
  return (
    <AdminFeedbackModal
      autoCloseMs={2200}
      message={message}
      title={title}
      variant="success"
    />
  );
}
