"use client";

import { useEffect } from "react";
import { initializeClientInquiryAttribution } from "@/features/inquiries/inquiry-attribution";

export function PublicInquiryAttributionCapture() {
  useEffect(() => {
    initializeClientInquiryAttribution();
  }, []);

  return null;
}
